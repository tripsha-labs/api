FROM node:14-alpine

WORKDIR /app

# Copy package.json and yarn.lock first
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the codebase
COPY . .

# Build the TypeScript code
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]