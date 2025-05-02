package cart

import (
	"backend/db"
	"backend/internal/logging"
	"backend/internal/utils"
	"backend/repository"
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// IsItemInCart checks if a specific item exists in the buyer's cart.
// Returns true if it exists, false otherwise.
// Returns an error if something goes wrong with the database query.
func IsItemInCart(q *repository.Queries, ctx context.Context, args repository.GetCartItemParams) (bool, error) {
	_, err := q.GetCartItem(ctx, args)

	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// AddToCart adds a new item to the buyer's cart if it's not already in the cart.
// Returns an error if the item is already in the cart or if any database operation fails.
func AddToCart(ctx context.Context, pool db.Pool, addToCartObj repository.AddToCartParams) utils.ServiceReturn[any] {
	q := repository.New(pool)

	getCartItemArgs := repository.GetCartItemParams{
		Bid: addToCartObj.Bid, Iid: addToCartObj.Iid, Vid: addToCartObj.Vid,
	}

	itemInCart, err := IsItemInCart(q, ctx, getCartItemArgs)
	logging.Infof("Item in cart: %v", itemInCart)

	if err != nil {
		logging.Errorf("There was an error in checking whether the item is already in the cart")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if itemInCart {
		logging.Errorf("Item already in cart")
		return utils.MakeError(errors.New("item already in cart"), http.StatusBadRequest)
	}

	err = q.AddToCart(ctx, addToCartObj)

	if err != nil {
		logging.Errorf("There was an error adding to cart")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"msg": "Item added to cart!",
		},
	}
}
// RemoveFromCart deletes an item from the buyer's cart.
// Returns an error if the item does not exist or if deletion fails.
func RemoveFromCart(ctx context.Context, pool db.Pool, args repository.DeleteCartItemParams) utils.ServiceReturn[any] {
	q := repository.New(pool)

	getCartItemArgs := repository.GetCartItemParams(args)

	itemInCart, err := IsItemInCart(q, ctx, getCartItemArgs)

	if err != nil {
		logging.Errorf("There was an error in checking whether the item is already in the cart")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !itemInCart {
		return utils.MakeError(errors.New("item is not in cart"), http.StatusBadRequest)
	}

	err = q.DeleteCartItem(ctx, args)
	if err != nil {
		logging.Errorf("There was an error deleting the cart item")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"msg": "item removed from cart",
		},
	}
}

// UpdateCartItemQuantity changes the quantity of an item already present in the cart.
// Returns an error if the item doesn't exist or if the update operation fails.
func UpdateCartItemQuantity(ctx context.Context, pool db.Pool, args repository.UpdateQuantityOfCartItemParams) utils.ServiceReturn[any] {
	q := repository.New(pool)

	getCartItemArgs := repository.GetCartItemParams{
		Bid: args.Bid, Iid: args.Iid, Vid: args.Vid,
	}

	itemInCart, err := IsItemInCart(q, ctx, getCartItemArgs)

	if err != nil {
		logging.Errorf("There was an error in checking whether the item is already in the cart")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	if !itemInCart {
		return utils.MakeError(errors.New("item is not in cart"), http.StatusBadRequest)
	}

	err = q.UpdateQuantityOfCartItem(ctx, args)
	if err != nil {
		logging.Errorf("There was an error updateing quantity of cart item")
		return utils.MakeError(err, http.StatusInternalServerError)
	}

	return utils.ServiceReturn[any]{
		Status: http.StatusOK,
		Data: utils.JMap{
			"msg": "item quantity updated",
		},
	}
}

// GetCartItemsForBuyer retrieves all cart items associated with a specific buyer.
// Returns an error if the retrieval operation fails.
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

// ClearCart deletes all items from a buyer’s cart.
// Returns an error if the clear operation fails.
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
			"msg": "Cart cleared",
		},
	}
}
