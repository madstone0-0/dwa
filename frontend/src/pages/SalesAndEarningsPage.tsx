import React, { useState, useEffect, FC } from "react";
import { WithLoadingProps, LoadingSpinner, withLoading } from "./withLoading";
import { Transaction, User } from "./types";
import { getLocalStorage } from "./utils";
import { getTransactions } from "./utils/api";

interface TransactionItemProps {
    transaction: Transaction;
}

const TransactionItem: FC<TransactionItemProps> = ({ transaction }) => {
    const { name, amt, t_time } = transaction;

    // Format date/time for display
    const formattedTime = new Date(t_time).toLocaleString();

    return (
        <div className="p-4 mb-4 bg-white rounded-lg shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                    <p className="text-sm text-gray-600">Time: {formattedTime}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-wine">GH₵{amt.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

// Sales summary component
interface SalesSummaryProps {
    transactions: Transaction[];
}

const SalesSummary: FC<SalesSummaryProps> = ({ transactions }) => {
    // Calculate summary metrics
    const totalEarnings = transactions.reduce((sum, sale) => sum + sale.amt, 0);
    const totalTransactions = transactions.length;
    const averageTransactionValue = totalTransactions > 0 ? totalEarnings / totalTransactions : 0;

    return (
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
            <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Total Earnings</h3>
                <p className="text-3xl font-bold text-wine">GH₵{totalEarnings.toFixed(2)}</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Total Transactions</h3>
                <p className="text-3xl font-bold text-indigo-600">{totalTransactions}</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Avg Transaction Value</h3>
                <p className="text-3xl font-bold text-emerald-600">GH₵{averageTransactionValue.toFixed(2)}</p>
            </div>
        </div>
    );
};

// Empty state component
const EmptyState: FC = () => (
    <div className="p-8 text-center">
        <svg className="mx-auto w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-800">No transaction history yet</h3>
        <p className="mt-1 text-gray-600">Your transaction history will appear here once you start making sales.</p>
        <button
            onClick={() => window.location.reload()}
            className="py-2 px-4 mt-4 text-sm font-medium text-white rounded-md hover:bg-opacity-90 bg-wine"
            style={{ backgroundColor: "#722F37" }}
        >
            Refresh Data
        </button>
    </div>
);

// Main component
const SalesAndEarningsPage: FC<WithLoadingProps> = ({ isLoading, withLoading }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [dateFilter, setDateFilter] = useState<string>("all");

    // Fetch transactions
    const fetchTransactions = async () => {
        const user = getLocalStorage("user") as unknown as User;

        if (user) {
            await withLoading(
                getTransactions(user.uid)
                    .then((data) => {
                        setTransactions(data);
                    })
                    .catch((error) => {
                        console.error("Error fetching transactions:", error);
                    }),
            );
        }
    };

    // Fetch transactions on component mount
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Filter transactions by date
    const filteredTransactions = React.useMemo(() => {
        if (dateFilter === "all") return transactions;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return transactions.filter((transaction) => {
            const transactionDate = new Date(transaction.t_time);

            switch (dateFilter) {
                case "today":
                    return transactionDate >= today;
                case "week":
                    return transactionDate >= thisWeekStart;
                case "month":
                    return transactionDate >= thisMonthStart;
                default:
                    return true;
            }
        });
    }, [transactions, dateFilter]);

    // Sort transactions by date (newest first)
    const sortedTransactions = [...filteredTransactions].sort(
        (a, b) => new Date(b.t_time).getTime() - new Date(a.t_time).getTime(),
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <main className="flex-grow p-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <h1 className="my-6 text-2xl font-bold text-gray-800">Sales & Earnings Overview</h1>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : transactions.length > 0 ? (
                        <>
                            {/* Summary Cards */}
                            <SalesSummary transactions={filteredTransactions} />

                            {/* Filter Options */}
                            <div className="flex mb-4 space-x-2">
                                <button
                                    onClick={() => setDateFilter("all")}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        dateFilter === "all"
                                            ? "bg-wine text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                    style={{
                                        backgroundColor: dateFilter === "all" ? "#722F37" : "",
                                    }}
                                >
                                    All Time
                                </button>
                                <button
                                    onClick={() => setDateFilter("today")}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        dateFilter === "today"
                                            ? "bg-wine text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                    style={{
                                        backgroundColor: dateFilter === "today" ? "#722F37" : "",
                                    }}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setDateFilter("week")}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        dateFilter === "week"
                                            ? "bg-wine text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                    style={{
                                        backgroundColor: dateFilter === "week" ? "#722F37" : "",
                                    }}
                                >
                                    This Week
                                </button>
                                <button
                                    onClick={() => setDateFilter("month")}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        dateFilter === "month"
                                            ? "bg-wine text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                    style={{
                                        backgroundColor: dateFilter === "month" ? "#722F37" : "",
                                    }}
                                >
                                    This Month
                                </button>
                            </div>

                            {/* Transactions List */}
                            <div className="space-y-0">
                                {sortedTransactions.length > 0 ? (
                                    sortedTransactions.map((transaction, index) => (
                                        <TransactionItem key={index} transaction={transaction} />
                                    ))
                                ) : (
                                    <p className="p-4 text-center text-gray-500">
                                        No transactions match the selected time period.
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </main>
        </div>
    );
};

export default withLoading(SalesAndEarningsPage);
