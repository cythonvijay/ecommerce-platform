pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify') {
            steps {
                echo 'Jenkins successfully checked out the e-commerce project!'
                sh 'git --version'
                sh 'docker --version'
            }
        }

        stage('Docker Connection') {
            steps {
                sh 'docker info'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t cythonvijay/ecommerce-backend:v2 ./backend'
                sh 'docker build -t cythonvijay/ecommerce-frontend:v2 ./frontend'
            }
        }
    }

    post {
        success {
            echo 'Jenkins pipeline completed successfully!'
        }

        failure {
            echo 'Jenkins pipeline failed.'
        }
    }
}