import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Fetch from "./Fetch";

export const useAuthErrorHandler = () => {
	const navigate = useNavigate();

	useEffect(() => {
		if (!Fetch.hasErrorHandler(401)) {
			Fetch.registerErrorHandler(401, () => {
				navigate("/signin", { replace: true });
				console.log("401 error handler triggered");
			});
		}

		// Clean up when component unmounts
		return () => {
			Fetch.clearErrorHandler(401);
		};
	}, [navigate]);
};
