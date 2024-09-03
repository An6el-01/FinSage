export interface Transaction {
    id: number;
    category_id: number;
    amount: number;
    date: number;
    description: string;
    type: "Expense" | "Income";
    category_name?: string; //In case its included in Fetch Query 
  }
  
  export interface Category {
    id: number;
    name: string;
    type: "Expense" | "Income";
  }
  
  export interface TransactionsByMonth {
    totalExpenses: number;
    totalIncome: number;
  }

  export type Goal = {
    id: number;
    name: string;
    amount: number;
    progress: number;
  };
  
  export type Budget = {
    id: number;
    category_id: number,
    amount: number,
    spent: number,
    type: "monthly" | "weekly";
  }

  export interface BackupData{
    [key: string]: Array<{ [key: string]: any }>;
  }