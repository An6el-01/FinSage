import pandas as pd

def preprocess_data(transactions):
     """
    Preprocess transaction data to prepare it for model training.
    :param transactions: List of transaction dictionaries.
    :return: Preprocessed DataFrame.
    """
     # Convert transactions list to DataFrame
     df = pd.DataFrame(transactions)

     # Convert data to datetime format
     df['date'] = pd.to_datetime(df['date'], unit='ms')

     # Create 'month_year' feature for grouping
     df['month_year'] = df['date'].dt.to_period('M')

     # Group by month and category, then sum the amounts
     grouped = df.groupby(['month_year', 'category_name']).agg({'amount': 'sum'}).unstack(fill_value=0)

     #Flatten the column MultiIndex for easier processing
     grouped.columns = grouped.columns.get_level_values(1)

     # Create a total expenditure column
     grouped['total_expenditure'] = grouped.sum(axis=1)

     # Create labels based on total expenditure
     # Assuming a threshold of 1000 for "High Savings"
     grouped['label'] = grouped['total_expenditure'].apply(lambda x: 'High Savings' if x < 1000 else 'Low Savings')
     
     return grouped.reset_index(drop=True)

def load_and_preprocess_data(transactions):
       """
    Load and preprocess transaction data.
    :param transactions: List of transaction dictionaries.
    :return: Tuple of features (X) and labels (y).
    """
       df = preprocess_data(transactions)

       #Features: All columns except 'label'
       X = df.drop(columns=['label'])

       # Labels: 'label' column
       y = df['label']

       return X,y
