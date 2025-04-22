# Source Code Folder

To be structured as needed by project team.

In order for the chatbot to run properly, you'll need to update the `.env` file in the `chatbot-backend` folder with your actual OpenAI key. **Do not** commit your key to the repository.

| Subdirectory Name             | Description |
| ------------------------------ | ----------- |
| `./assets`                     | `Contains the css, javascript, image files, and video files for the project` |
| `./blogs`                      | `Contains all blogs for the "Blog" page with captivating thumbnails` |
| `./chatbot-backend`            | `Contains Server.js -> prompt and implementation for the chatbot on the "Trip Planner" page, program launches with "node server.js"` |
| `./video_generator_prototype`  | `Contains the source code for the Video Generator used in the Explore page` |
| `index.html`                   | `The "Home" page which has a way to jump to the chatbot and blogs` |
| `destination.html`             | `The "Destinations" page with an AI-generated video for every destination that our company offers ` |
| `trip-planner.html`            | `The "Trip Planner" page with access to the chatbot which is finetuned on our destinations and uses gpt-4o-mini` |
| `explore.html`                 | `The "Explore" page with and interactive way to video videos made with the Video Generator` |
| `blog.html`                    | `The "Blog" page with a blog for every destination that our company offers` |
| `book.html`                    | `The "Book" page which includes a referral link to Sandals and a 777 promotion video` |
| `contact-us.html`              | `The "Contact Us" page with all socials` |
| `about.html`                   | `The "About Us" page with information on the Paradise Portfolios team` |
| `.env`                         | `Fill in your OpenAI API key here!` |
