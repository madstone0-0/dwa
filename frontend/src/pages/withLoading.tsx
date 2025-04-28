import React, { useState, ComponentType } from "react";

export interface WithLoadingProps {
	isLoading: boolean;
	setLoading: (isLoading: boolean) => void;
	withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export const withLoading = <P extends object>(
	WrappedComponent: ComponentType<P & WithLoadingProps>,
) => {
	// Return a new component with the loading functionality
	return (props: P) => {
		const [isLoading, setIsLoading] = useState<boolean>(false);

		// Helper function to wrap promises with loading state
		const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
			setIsLoading(true);
			try {
				return await promise;
			} finally {
				setIsLoading(false);
			}
		};

		// Pass the loading state and helpers to the wrapped component
		return (
			<WrappedComponent
				{...props}
				isLoading={isLoading}
				setLoading={setIsLoading}
				withLoading={withLoading}
			/>
		);
	};
};

export const LoadingSpinner: React.FC = () => (
	<div className="flex justify-center items-center py-12">
		<div className="w-12 h-12 rounded-full border-4 border-gray-300 animate-spin border-t-wine"></div>
	</div>
);
