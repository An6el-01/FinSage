import sqlite3
import pandas as pd
from fetch_data import fetch_categories, fetch_transaction_data, calculate_average_spending

def preprocess_data(transactions, average_spending):
    """
    Preprocess transaction data to prepare it for model training.
    :param transactions: DataFrame of transactions.
    :param average_spending: Dictionary with average spending per category.
    :return: Preprocessed DataFrame.
    """
    transactions['date'] = pd.to_datetime(transactions['date'], unit='ms')
    transactions['month_year'] = transactions['date'].dt.to_period('M')

    # Group by month and category, then sum the amounts
    grouped = transactions.groupby(['month_year', 'category_name']).agg({'amount': 'sum', 'date': 'count'}).unstack(fill_value=0)
    grouped.columns = grouped.columns.map(lambda x: f'{x[1]}_{x[0]}')

    # Add total expenditure per month
    grouped['total_expenditure'] = grouped.filter(like='amount').sum(axis=1)

    # Calculate percentage of spending per category relative to total income
    for category in average_spending.keys():
        grouped[f'{category}_percent_of_income'] = (grouped[f'{category}_amount'] / grouped['total_expenditure']) * 100

    # Add month-to-month spending changes
    for category in average_spending.keys():
        grouped[f'{category}_monthly_change'] = grouped[f'{category}_amount'].pct_change().fillna(0)

    def classify_spending(row):
        exceeded_categories = []
        within_range_categories = []
        
        for category, avg_spending in average_spending.items():
            threshold = avg_spending * 1.1  # 110% of average monthly spending
            if row.get(f'{category}_amount', 0) > threshold:
                exceeded_categories.append(category)
            else:
                within_range_categories.append(category)
        
        # Determine the overall label based on whether any categories exceeded the threshold
        if exceeded_categories:
            return "Exceeded Budget"
        else:
            return "Within Budget"

    grouped['label'] = grouped.apply(classify_spending, axis=1)
    X = grouped.drop(columns=['label'])
    y = grouped['label']

    return X, y

def load_and_process_data(db_path, user_income, previous_spending_patterns):
    """
    Load and preprocess transaction data.
    :param db_path: Path to the SQLite database file.
    :param user_income: User's income
    :param previous_spending_patterns: Dictionary of user's previous spending patterns
    :return: Tuple of features (X) and labels (y)
    """
    # Fetch transactions and categories from the database
    transactions = fetch_transaction_data(db_path)
    categories = fetch_categories(db_path)

    # Calculate average spending for each category
    average_spending = calculate_average_spending(transactions)

    # Preprocess the data with the calculated average spending and additional features
    X, y = preprocess_data(transactions, average_spending)

    return X, y
