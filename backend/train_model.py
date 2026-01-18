from ml_model import DropoutPredictor

predictor = DropoutPredictor()

df = predictor.generate_synthetic_data(500)
predictor.train_model(df)

predictor.save_model("dropout_model.pkl")

print("✅ Model trained and saved successfully")
