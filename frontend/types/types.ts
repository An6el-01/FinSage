export interface Users {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: number;
  updated_at: number;
  is_premium: boolean;
}

export interface Transactions {
    id: number;
    user_id: number;
    category_id: number;
    amount: number;
    date: number;
    description: string;
    type: "Expense" | "Income";
  }
  
  export interface TransactionsCategories {
    id: number;
    name: string;
    type: "Expense" | "Income";
    category: "want" | "need" | "savings";
  }

  export interface SavingsGoals {
    id: number;
    user_id: number;
    name: string;
    amount: number;
    progress: number;
    target_date: number;
    favorite: boolean;
  };
  
  export interface Budgets {
    id: number;
    user_id: number,
    category_id: number,
    amount: number,
    spent: number,
    type: "monthly" | "weekly";
    created_at: number;
    updated_at: number;
    favorite: boolean;
  }

  export interface CryptoPortfolios {
    id: number;
    user_id: number;
    crypto_name: string;
    amount_held: number;
    current_value: number;
    last_updated: number;
  }

  export interface Investments {
    id: number;
    user_id: number;
    investment_type: string;
    amount_invested: number;
    current_value: number;
    created_at: number;
  }

  export interface AIRecommendations {
    id: number;
    user_id: number;
    type: string;
    recommendation: string;
    created_at: number;
  }

  export interface FinancialForecasts {
    id: number;
    user_id: number;
    forecast_type: string;
    forecast_value: number;
    date: number;
    forecast_description: string;
  }

  export interface Notifications {
    id: number;
    user_id: number;
    message: string;
    created_at: number;
    read: boolean;
    notification_description: string;
  }

  export interface Currencies {
    id: number;
    base_currency: string;
    conversion_rates: JSON;
    name: string;
  }

  export interface TransactionsByMonth {
    totalExpenses: number;
    totalIncome: number;
  }

  export interface FinancialOverviewProps {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
  }

  export interface RecentTransactionProps {
    transactions: Transactions[];
  }
  export interface BackupData{
    [key: string]: Array<{ [key: string]: any }>;
  }