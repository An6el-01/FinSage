import pandas as pd

def preprocess_data(transactions):
    """
    Preprocess transaction data to prepare it for model training.
    :param transactions: List of transaction dictionaries.
    :return: Preprocessed DataFrame.
    """
    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'], unit='ms')
    df['month_year'] = df['date'].dt.to_period('M')

    # Group by month and category, then sum the amounts
    grouped = df.groupby(['month_year', 'category_name']).agg({'amount': 'sum'}).unstack(fill_value=0)
    grouped.columns = grouped.columns.get_level_values(1)
    grouped['total_expenditure'] = grouped.sum(axis=1)

    # Create more detailed labels based on spending patterns
    def classify_spending(row):
        recommendations = []
        if row.get('Dining Out', 0) > 200:
            recommendations.append('Reduce Dining Out')
        if row.get('Leisure', 0) > 150:
            recommendations.append('Cut Back on Leisure')
        if row.get('Utilities', 0) > 300:
            recommendations.append('Consider Energy Saving Tips')
        if row.get('Groceries', 0) > 500:
            recommendations.append('Optimize Grocery Shopping')
        if row.get('Subscriptions', 0) > 100:
            recommendations.append('Review and Reduce Subscriptions')
        if row.get('Travel', 0) > 300:
            recommendations.append('Plan Travel More Efficiently')
        if row.get('Clothing', 0) > 150:
            recommendations.append('Limit Clothing Purchases')

        if not recommendations:
            recommendations.append('Maintain Good Habits')

        return recommendations
    
    grouped['label'] = grouped.apply(classify_spending, axis=1)
    return grouped.reset_index(drop=True)

def load_and_preprocess_data(transactions):
    """
    Load and preprocess transaction data.
    :param transactions: List of transaction dictionaries.
    :return: Tuple of features (X) and labels (y).
    """
    df = preprocess_data(transactions)

    # Features: All columns except 'label'
    X = df.drop(columns=['label'])

    # Labels: 'label' column
    y = df['label']

    return X, y
