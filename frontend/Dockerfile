# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Create proper ESLint config
RUN echo "module.exports = { \
  root: true, \
  env: { \
    node: true, \
    es6: true \
  }, \
  extends: [ \
    'plugin:vue/vue3-essential', \
    'eslint:recommended' \
  ], \
  parserOptions: { \
    ecmaVersion: 2020, \
    sourceType: 'module' \
  }, \
  rules: { \
    'no-console': 'off', \
    'no-debugger': 'off' \
  } \
};" > .eslintrc.js

RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Copy built files from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]