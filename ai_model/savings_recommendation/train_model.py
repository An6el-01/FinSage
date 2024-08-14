import joblib
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from data_processing import load_and_preprocess_data

# Example transaction data (replace this with actual data fetching)
transactions = []

# Load and preprocess the data
X, y = load_and_preprocess_data(transactions)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Initialize the Decision Tree Model
model = DecisionTreeClassifier()

# Train the model
model.fit(X_train, y_train)

#Evaluate the model
y_pred = model.predict(X_test)
print("Accuracy", accuracy_score(y_test, y_pred))
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save the trained model to a file
joblib.dump(model, 'savings_recommendation_model.pkl')