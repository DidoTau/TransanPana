# TransanPana

This is a Telegram bot project using NodeJS and MongoDB.

TransanPana is a bot that assists you in requesting Transantiago services and provides information on which bus will arrive at a specific bus stop.

Why MongoDB? Well, I wanted to practice using it, although I understand that it may not be the optimal choice. It was primarily for pedagogical purposes.

## HOW TO RUN

The entire project is wrapped in a Docker container, so having Docker installed on your local machine is sufficient. Follow these steps to run the project:

1. Make sure Docker is installed.
2. Open a terminal or command prompt.
3. Navigate to the project directory.
4. Run the following command:

   ```
   docker-compose up --build
   ```

## TO DO:

- Improve message styling.
- Implement the 'add and delete favorites' feature.
- Allow users to ask for the nearest bus stop based on their geolocation.
