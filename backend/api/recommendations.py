from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import sqlite3

# Load trained model
model_path = os.path.join(os.path.dirname(__file__), './models/final_savings_recommendation_model.pkl')
print(f"Loading model from: {model_path}")
model = joblib.load(model_path)

app = FastAPI()

class TransactionData(BaseModel):
    amount: float
    date: str
    category_name: str
    type: str

# Expected categories that were used during model training
EXPECTED_CATEGORIES = [
    "Groceries", "Rent", "Leisure", "Travel", "Dining Out", "Freelancing", 
    "Gifts Received", "Utilities", "Electronics", "Subscriptions", 
    "Clothing", "Bonus", "Pet Care", "Transportation", "Salary"
]

def fetch_categories(db_path='../../frontend/assets/mySQLiteDB.db'):
    """
    Fetch category names from the database.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()  
    cursor.execute('SELECT name FROM Categories')
    categories = [row[0] for row in cursor.fetchall()]
    conn.close()
    return categories

def prepare_input_data(transaction: TransactionData, categories: list):
    data = {}

    # Filter categories to only include those used during training
    filtered_categories = [cat for cat in categories if cat in EXPECTED_CATEGORIES]

    # Initialize all feature columns with 0
    for category in EXPECTED_CATEGORIES:
        data[f"{category}_amount"] = 0
        data[f"{category}_date"] = 0
        data[f"{category}_monthly_change"] = 0
        data[f"{category}_percent_of_income"] = 0

    # Initialize total_expenditure column
    data['total_expenditure'] = 0

    # Set the amount for the provided category if it's in the expected list
    if transaction.category_name in filtered_categories:
        data[f"{transaction.category_name}_amount"] = transaction.amount

    # Calculate total expenditure
    data['total_expenditure'] = sum([data[f"{category}_amount"] for category in EXPECTED_CATEGORIES])

    # Convert to DataFrame
    df = pd.DataFrame([data])

    # Align columns with the model's expected feature order
    expected_features = model.feature_names_in_
    df = df.reindex(columns=expected_features, fill_value=0)

    return df

def generate_recommendations(predictions, categories):
    """
    Generate detailed recommendations based on predictions.
    """
    recommendation_map = {
        'Reduce Dining Out': ["Dining Out"],
        'Cut Back on Leisure': ["Leisure"],
        'Consider Energy Saving Tips': ["Utilities"],
        'Optimize Grocery Shopping': ["Groceries"],
        'Review and Reduce Subscriptions': ["Subscriptions"],
        'Plan Travel More Efficiently': ["Travel"],
        'Limit Clothing Purchases': ["Clothing"],
    }
    
    detailed_recommendations = []
    
    for i, prediction in enumerate(predictions):
        category_recommendations = []
        for recommendation, affected_categories in recommendation_map.items():
            if any(category in categories[i] for category in affected_categories):
                category_recommendations.append(f"{recommendation}: Consider focusing on these categories: {', '.join(affected_categories)}.")
        if not category_recommendations:
            category_recommendations.append("Great job! Keep up the good savings habits.")
        detailed_recommendations.extend(category_recommendations)
    
    return detailed_recommendations

@app.post("/api/recommendations")
async def get_recommendations(transactions: list[TransactionData]):
    try:
        # Fetch categories dynamically
        categories = fetch_categories()

        # Prepare input data for all transactions and ensure features align
        X_new = pd.concat([prepare_input_data(transaction, categories) for transaction in transactions])

        # Check the features in X_new against the expected model features
        expected_features = model.feature_names_in_

        # Align the DataFrame columns to match the expected order and fill missing columns with 0
        X_new = X_new.reindex(columns=expected_features, fill_value=0)

        # Make the prediction for each transaction
        print("Making predictions")
        predictions = model.predict(X_new)
        print("Predictions made")

        # Log predictions
        for prediction in predictions:
            print("Prediction: ", prediction)

        # Generate more detailed recommendations
        print("Generating detailed recommendations")
        detailed_recommendations = generate_recommendations(predictions, categories)

        print("Recommendations: ", detailed_recommendations)
        return {"recommendations": detailed_recommendations}
    except Exception as e:
        return {"Exception error": str(e)}

port = int(os.environ.get("PORT", 8080))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)
