FROM python:3.10-slim

#Set the working directoryin docker
WORKDIR /app

#Copy contents from this directory to docker
COPY . /app

#Install all needed packages
RUN pip install --no-cache-dir -r requirements.txt

#Make port 8000 available to the world
EXPOSE 8080

#Define environment variable
ENV PORT=8080

# Run application
CMD ["uvicorn", "recommendations:app", "--host", "0.0.0.0", "--port", "8080"]