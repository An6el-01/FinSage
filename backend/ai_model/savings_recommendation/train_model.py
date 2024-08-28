import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, classification_report
from data_processing import preprocess_data, calculate_average_spending

# Paths to CSV files containing mock data
csv_path = "../mock_data/mock_transactions.csv"
csv_path2 = "../mock_data/mock_transactions_new.csv"
csv_path3 = "../mock_data/mock_transactions_new2.csv"

# Load mock data from CSV files
mock_data1 = pd.read_csv(csv_path)
transactions1 = mock_data1.to_dict('records')  # Convert DataFrame to a list of dictionaries

mock_data2 = pd.read_csv(csv_path2)
transactions2 = mock_data2.to_dict('records')  # Convert DataFrame to a list of dictionaries

mock_data3 = pd.read_csv(csv_path3)
transactions3 = mock_data3.to_dict('records')  # Convert DataFrame to a list of dictionaries

# Combine the transaction lists
combined_transactions = transactions1 + transactions2 + transactions3

# Convert the combined transactions back to a DataFrame
transactions_df = pd.DataFrame(combined_transactions)

print("Sample of combined transactions data:")
print(transactions_df.head())  # Display first few rows of combined data

# Calculate average spending for each category using mock data
average_spending = calculate_average_spending(transactions_df)
print("Average spending per category:")
print(average_spending)  # Print the calculated average spending

# Preprocess the data using the calculated average spending and additional features
X, y = preprocess_data(transactions_df, average_spending)

print("\nSample of preprocessed feature data (X):")
print(X.head())  # Display first few rows of features
print("\nSample of labels (y):")
print(y.head())  # Display first few rows of labels
print("Number of features:", len(X.columns))
print("Feature names:", X.columns.tolist())

# Ensure the labels (y) are strings (categorical)
y = y.astype(str)
print("Number of samples:", len(X))

# Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

print("\nTraining set size:", X_train.shape)
print("Test set size:", X_test.shape)

# Define the parameter grid for hyperparameter tuning
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'bootstrap': [True, False]
}

# Initialize the Random Forest Model
rf = RandomForestClassifier(random_state=42)
print("\nStarting GridSearchCV for hyperparameter tuning...")

# Perform GridSearchCV to find the best hyperparameters
grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2)
grid_search.fit(X_train, y_train)

# Best parameters from GridSearchCV
print("\nBest parameters found: ", grid_search.best_params_)

# Train the model with the best found parameters
best_rf = grid_search.best_estimator_

# Evaluate the model
y_pred = best_rf.predict(X_test)
print("\nAccuracy on test set: ", accuracy_score(y_test, y_pred))
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save the trained model to a file
joblib.dump(best_rf, 'savings_recommendation_model.pkl')
print("\nModel saved as 'savings_recommendation_model.pkl'")

# ---------------------------------------------
# Retrain on the entire dataset using best params
# ---------------------------------------------
best_params = grid_search.best_params_
print("\nRetraining on the entire dataset with best parameters:", best_params)

# Initialize the RandomForestClassifier with the best hyperparameters
final_model = RandomForestClassifier(**best_params)

# Train on the entire dataset
final_model.fit(X, y)
print("\nFinal model training complete.")

# Optional: Save the final model
joblib.dump(final_model, 'final_savings_recommendation_model.pkl')
print("Model retrained on entire dataset and saved as 'final_savings_recommendation_model.pkl'")
