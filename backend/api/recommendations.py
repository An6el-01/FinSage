from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import os

# Load trained model
model_path = os.path.join(os.path.dirname(__file__), 'models', 'savings_recommendation_model.pkl')
print(f"Loading model from: {model_path}")
model = joblib.load(model_path)

app = FastAPI()

class TransactionData(BaseModel):
    amount: float
    date: str
    category_name: str
    type: str

@app.post("/api/recommendations")
async def get_recommendations(transactions: list[TransactionData]):
    try:
        # Prepare input data for all transactions
        X_new = pd.concat([prepare_input_data(transaction) for transaction in transactions])

        # Make the prediction for each transaction
        predictions = model.predict(X_new)

        # Generate more detailed recommendations
        detailed_recommendations = []
        for prediction_list in predictions:
            for prediction in prediction_list:
                if prediction == 'Reduce Dining Out':
                    detailed_recommendations.append("Consider cooking at home more often to save on dining expenses.")
                elif prediction == 'Cut Back on Leisure':
                    detailed_recommendations.append("Try free or low-cost leisure activities to save money.")
                elif prediction == 'Consider Energy Saving Tips':
                    detailed_recommendations.append("Look into energy-saving tips to reduce your utility bills.")
                elif prediction == 'Optimize Grocery Shopping':
                    detailed_recommendations.append("Plan your grocery shopping better by making a list and sticking to it, and avoid shopping when hungry.")
                elif prediction == 'Review and Reduce Subscriptions':
                    detailed_recommendations.append("Review your subscriptions and cancel those you rarely use.")
                elif prediction == 'Plan Travel More Efficiently':
                    detailed_recommendations.append("Plan your travels in advance to get better deals and reduce impulsive expenses.")
                elif prediction == 'Limit Clothing Purchases':
                    detailed_recommendations.append("Consider buying fewer clothes and focusing on versatile items.")
                else:
                    detailed_recommendations.append("Great job! Keep up the good savings habits.")
        
        return {"recommendations": detailed_recommendations}
    except Exception as e:
        return {"error": str(e)}


def prepare_input_data(transaction: TransactionData):
    # Include all categories that were used during model training
    categories = ["Groceries", "Rent", "Leisure", "Travel", "Dining Out", "Freelancing", 
                  "Gifts Received", "Utilities", "Electronics", "Subscriptions", 
                  "Clothing", "Bonus", "Pet Care", "Transportation", "Salary"]
    
    # Initialize all categories to 0
    data = {category: [0] for category in categories}
    
    # Set the amount for the provided category
    if transaction.category_name in data:
        data[transaction.category_name] = [transaction.amount]
    
    # Create DataFrame in the correct order
    df = pd.DataFrame(data, columns=categories)
    
    # Calculate total expenditure for the month (just summing up the categories)
    df['total_expenditure'] = df.sum(axis=1)
    
    # Ensure columns are in the same order as during training
    df = df.reindex(sorted(df.columns), axis=1)
    
    return df

port = int(os.environ.get("PORT", 8080))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)
