import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from data_processing import load_and_preprocess_data
from fetch_data import fetch_transaction_data  # Import the data fetching function

# Paths to your CSV files containing mock data
csv_path = '../mock_data/mock_transactions.csv'
csv_path2 = '../mock_data/mock_transactions_new.csv'
csv_path3 = '../mock_data/mock_transactions_new2.csv'

# Load mock data from CSV files
mock_data1 = pd.read_csv(csv_path)
transactions1 = mock_data1.to_dict('records')  # Convert DataFrame to a list of dictionaries

mock_data2 = pd.read_csv(csv_path2)
transactions2 = mock_data2.to_dict('records')  # Convert DataFrame to a list of dictionaries

mock_data3 = pd.read_csv(csv_path3)
transactions3 = mock_data3.to_dict('records')

# Combine the transaction lists
combined_transactions = transactions1 + transactions2 + transactions3

# Load and preprocess the combined data
X, y = load_and_preprocess_data(combined_transactions)

# Ensure the labels (y) are strings (categorical)
y = y.astype(str)
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
