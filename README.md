# CodeNative Backend

Backend server that provides the api to CodeNative frontend at [https://api.codenative.click](https://api.codenative.click)

# Run Locally

- Move into the root directory and run `npm install`, `npm run dev`

# Tech-Stack

- Node.js
- Typescript
- Express
- @aws-sdk
- graphql
- apollo-server
- mongoose
- type-graphql
- typegoose
- MongoDB - Database

## Additional libraries

- eslint - Formatting
- SWC - Superfast TS transpiler
- nodemon - dev env

# Features

- Api endpoint to create an on-demand docker container and return the public ip.
- graphql end points to perform CRUD operations on files in DB.

# Scripts

- `npm run dev`: To start the development server on localhost
- `npm run build`: To create a production build
