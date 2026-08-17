pipeline {
    agent any

    stages {

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
                sh '''
                    docker build -t cythonvijay/ecommerce-backend:v2 ./backend
                    docker build -t cythonvijay/ecommerce-frontend:v2 ./frontend
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

                        docker push cythonvijay/ecommerce-backend:v2
                        docker push cythonvijay/ecommerce-frontend:v2

                        docker logout
                    '''
                }
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