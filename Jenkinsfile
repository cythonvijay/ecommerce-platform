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
    }

    post {
        success {
            echo '✅ Jenkins pipeline completed successfully!'
        }

        failure {
            echo '❌ Jenkins pipeline failed.'
        }
    }
}