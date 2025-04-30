package cart

import (
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"database/sql"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

func IsItemInCart(q *repository.Queries, ctx context.Context, args repository.GetCartItemParams) (error, bool) {
	_, _err := q.GetCartItem(ctx, args)

	if _err == sql.ErrNoRows {
		logging.Debugf("The cart item does not exist")
		return nil, false
	} else if _err != nil {

		return _err, false
	} else {
		//there was no error and a cart item was found
		return errors.New("cart already in item"), true
	}
}

func AddToCart(ctx context.Context, pool db.Pool, addToCartObj repository.AddToCartParams) utils.ServiceReturn[any] {
	q := repository.New(pool)

	getCartItemArgs := repository.GetCartItemParams{
		Bid: addToCartObj.Bid, Iid: addToCartObj.Iid, Vid: addToCartObj.Vid,
	}

	_err, itemInCart := IsItemInCart(q, ctx, getCartItemArgs)

	if _err != nil && !itemInCart {
		logging.Errorf("There was an error in checking whether the item is already in the cart")
		return utils.MakeError(_err, http.StatusInternalServerError)
	} else if _err != nil && itemInCart {
		logging.Errorf("Item already in cart")
		return utils.MakeError(_err, http.StatusBadRequest)
	}

	err := q.AddToCart(ctx, addToCartObj)

	if err != nil {
		logging.Errorf("There was an error adding to cart")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"message": "Item added to cart!",
		},
	}
}

func RemoveFromCart(ctx context.Context, pool db.Pool, args repository.DeleteCartItemParams) utils.ServiceReturn[any] {
	q := repository.New(pool)

	getCartItemArgs := repository.GetCartItemParams{
		Bid: args.Bid, Iid: args.Iid, Vid: args.Vid,
	}
	_err, itemInCart := IsItemInCart(q, ctx, getCartItemArgs)

	if _err != nil && !itemInCart {
		logging.Errorf("There was an error in checking whether the item is already in the cart")
		return utils.MakeError(_err, http.StatusInternalServerError)
	}

	if _err == nil {
		return utils.MakeError(errors.New("item is not in cart"), http.StatusBadRequest)
	}

	err := q.DeleteCartItem(ctx, args)
	if err != nil {
		logging.Errorf("There was an error deleting the cart item")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"message": "item removed from cart",
		},
	}
}

func UpdateCartItemQuantity(ctx context.Context, pool db.Pool, args repository.UpdateQuantityOfCartItemParams) utils.ServiceReturn[any] {
	q := repository.New(pool)

	getCartItemArgs := repository.GetCartItemParams{
		Bid: args.Bid, Iid: args.Iid, Vid: args.Vid,
	}
	_err, itemInCart := IsItemInCart(q, ctx, getCartItemArgs)

	if _err != nil && !itemInCart {
		logging.Errorf("There was an error in checking whether the item is already in the cart")
		return utils.MakeError(_err, http.StatusInternalServerError)
	}

	if _err == nil {
		return utils.MakeError(errors.New("item is not in cart"), http.StatusBadRequest)
	}

	err := q.UpdateQuantityOfCartItem(ctx, args)
	if err != nil {
		logging.Errorf("There was an error updateing quantity of cart item")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"message": "item quantity updated",
		},
	}
}

func GetCartItemsForBuyer(ctx context.Context, pool db.Pool, bid pgtype.UUID) utils.ServiceReturn[any] {
	q := repository.New(pool)
	cartItems, err := q.GetCartItemsForBuyer(ctx, bid)

	if err != nil {
		logging.Errorf("There was an error getting cart items for buyer")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"items": cartItems,
		},
	}
}

func ClearCart(ctx context.Context, pool db.Pool, bid pgtype.UUID) utils.ServiceReturn[any] {
	q := repository.New(pool)
	err := q.ClearCart(ctx, bid)

	if err != nil {
		logging.Errorf("There was an error clearning cart")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"message": "Cart cleared",
		},
	}
}
