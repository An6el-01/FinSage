import sqlite3
import pandas as pd

def fetch_transaction_data(db_path):
    """
    Fetch transaction data from the SQLite database.
    :param db_path: Path to the SQLite database file.
    :return: List of transaction dictionaries.
    """
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Execute the query
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

    # Fetch all rows from the query
    rows = cursor.fetchall()

    # Get column names from the cursor description
    column_names = [description[0] for description in cursor.description]

    # Convert rows to list of dictionaries
    transactions = [dict(zip(column_names, row)) for row in rows]

    # Close the connection
    conn.close()

    return transactions
