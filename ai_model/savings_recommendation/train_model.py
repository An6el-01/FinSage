import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from data_processing import load_and_preprocess_data
from fetch_data import fetch_transaction_data  # Import the data fetching function

# Paths to your SQLite database files

csv_path = '../Databases/mock_transactions.csv'  # CSV file containing mock data
csv_path2 = '../Databases/mock_transactions_new.csv'
csv_path3 = '../Databases/mock_transactions_new2.csv'


# Fetch transaction data from SQLite databases

# Load mock data from CSV file
mock_data = pd.read_csv(csv_path)
transactions1 = mock_data.to_dict('records')  # Convert DataFrame to a list of dictionaries

mock_data = pd.read_csv(csv_path2)
transactions2 = mock_data.to_dict('records')  # Convert DataFrame to a list of dictionaries

mock_data = pd.read_csv(csv_path3)
transactions3 = mock_data.to_dict('records') 

# Combine the transaction lists
combined_transactions = transactions1 + transactions2 + transactions3

# Load and preprocess the combined data
X, y = load_and_preprocess_data(combined_transactions)
print("Number of samples:", len(X))

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Initialize the Decision Tree Model
model = DecisionTreeClassifier()

# Train the model
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save the trained model to a file
joblib.dump(model, 'savings_recommendation_model.pkl')
