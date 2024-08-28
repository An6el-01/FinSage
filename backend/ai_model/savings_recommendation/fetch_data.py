import sqlite3
import pandas as pd

def fetch_transaction_data(db_path):
    """
    Fetch transaction data from the SQLite database
    :param db_path: Path to the SQLite database file
    :return: DataFrame of the transactions with category names included
    """
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Execute the query to fetch transactions with category names
    cursor.execute('''
        SELECT
            Transactions.amount,
            Transactions.date,
            Categories.name AS category_name,
            Transactions.type
        FROM Transactions
        JOIN Categories ON Transactions.category_id = Categories.id
        ORDER BY Transactions.date DESC;
    ''')
    # Fetch all the rows from the query
    rows = cursor.fetchall()
    # Get column names from the cursor description
    column_names = [description[0] for description in cursor.description]
    # Convert rows to a DataFrame
    df = pd.DataFrame(rows, columns=column_names)
    # Close the connection
    conn.close()

    return df

def fetch_categories(db_path):
    """
    Fetch category data from the SQLite database.
    :param db_path: Path to the SQLite database file.
    :return: List of category dictionaries.
    """

    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Execute the query to fetch categories
    cursor.execute('SELECT id, name, type FROM Categories')

    # Fetch all rows from the query
    rows = cursor.fetchall()
    
    # Get column names from the cursor description
    column_names = [description[0] for description in cursor.description]

    # Convert rows to a DataFrame
    df = pd.DataFrame(rows, columns=column_names)

    # Close the connection
    conn.close()

    return df

def calculate_average_spending(transactions):
    """
    Calculate average monthly spending per category
    :param transactions: DataFrame of transactions
    :return: Dictionary with category names as keys and average spending as values
    """
    transactions['date'] = pd.to_datetime(transactions['date'], unit='ms')
    transactions['month_year'] = transactions['date'].dt.to_period('M')

    # Filter for expense transactions only
    df_expenses = transactions[transactions['type'] == 'Expense']

    # Group by category and month, then calculate the mean
    monthly_spending = df_expenses.groupby(['category_name', 'month_year']).agg({'amount': 'sum'})
    average_spending = monthly_spending.groupby('category_name').mean()

    # Convert to a dictionary with category names as keys
    average_spending_dict = average_spending['amount'].to_dict()

    return average_spending_dict
