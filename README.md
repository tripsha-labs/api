# Serverless Node.js Starter

A Serverless starter that adds ES7 syntax, serverless-offline, environment variables, and unit test support. Part of the [Serverless Stack](http://serverless-stack.com) guide.

[Serverless Node.js Starter](https://github.com/AnomalyInnovations/serverless-nodejs-starter) uses the [serverless-webpack](https://github.com/serverless-heaven/serverless-webpack) plugin, [Babel](https://babeljs.io), [serverless-offline](https://github.com/dherault/serverless-offline), and [Jest](https://facebook.github.io/jest/). It supports:

- **ES7 syntax in your handler functions**
  - Use `import` and `export`
- **Package your functions using Webpack**
- **Run API Gateway locally**
  - Use `serverless offline start`
- **Support for unit tests**
  - Run `npm test` to run your tests
- **Sourcemaps for proper error messages**
  - Error message show the correct line numbers
  - Works in production with CloudWatch
- **Automatic support for multiple handler files**
  - No need to add a new entry to your `webpack.config.js`
- **Add environment variables for your stages**

---

### Demo

A demo version of this service is hosted on AWS - [`https://z6pv80ao4l.execute-api.us-east-1.amazonaws.com/dev/hello`](https://z6pv80ao4l.execute-api.us-east-1.amazonaws.com/dev/hello)

And here is the ES7 source behind it

```javascript
export const hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Go Serverless v1.0! ${await message({
        time: 1,
        copy: 'Your function executed successfully!',
      })}`,
      input: event,
    }),
  };
};

const message = ({ time, ...rest }) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(`${rest.copy} (with a delay)`);
    }, time * 1000)
  );
```

### Requirements

- [Install the Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/installation/)
- [Configure your AWS CLI](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

### Installation

To create a new Serverless project.

```bash
$ serverless install --url https://github.com/AnomalyInnovations/serverless-nodejs-starter --name my-project
```

Enter the new directory

```bash
$ cd my-project
```

Install the Node.js packages

```bash
$ npm install
```

### Usage

To run unit tests on your local

```bash
$ npm test
```

To run a function on your local

```bash
$ serverless invoke local --function hello
```

To simulate API Gateway locally using [serverless-offline](https://github.com/dherault/serverless-offline)

```bash
$ serverless offline start
```

Run your tests

```bash
$ npm test
```

We use Jest to run our tests. You can read more about setting up your tests [here](https://facebook.github.io/jest/docs/en/getting-started.html#content).

Deploy your project

```bash
$ serverless deploy
```

Deploy a single function

```bash
$ serverless deploy function --function hello
```

To add another function as a new file to your project, simply add the new file and add the reference to `serverless.yml`. The `webpack.config.js` automatically handles functions in different files.

To add environment variables to your project

1. Rename `env.example` to `env.yml`.
2. Add environment variables for the various stages to `env.yml`.
3. Uncomment `environment: ${file(env.yml):${self:provider.stage}}` in the `serverless.yml`.
4. Make sure to not commit your `env.yml`.

## Testing

Our testing strategy involves a combination of end-to-end, integration tests, and unit tests, following an Outside-In Testing approach. This approach, also known as Top-Down Testing, starts with higher-level tests (end-to-end tests), then moves to integration tests, and finally to unit tests. 

This strategy is often used in conjunction with Behavior-Driven Development (BDD), a software development methodology that emphasizes collaboration and drives development by meaningful interactions with the end product. BDD encourages the use of scenarios and user-focused narratives to describe application behavior.

### Why Outside-In Testing?

Outside-In Testing allows us to understand the system's behavior from the user's perspective before focusing on individual components. This approach can be more time-efficient as it helps to identify major issues that may require architectural changes early in the development process, thus reducing the risk of having to perform significant rework.

Moreover, it aligns well with the principles of BDD, ensuring that all development work contributes towards delivering value to the user and meeting business requirements.
### End-to-End Tests

End-to-end tests simulate user interactions and test the entire system as a whole. They are located in a top-level `tests/e2e` directory.

We use an in-memory MongoDB database and a live server to simulate a real-world environment for these tests. This allows us to ensure that our system behaves as expected under realistic conditions.

To run the end-to-end tests, use the command:

```bash
npm run test:e2e
```

### Integration Tests

Integration tests focus on the interaction between different parts of the application, such as routes and middleware. They are located in a top-level `tests/integration` directory.

To run the integration tests, use the command:

```bash
npm run test:integration
```

### Unit Tests

Unit tests focus on individual functions or components in isolation. They are colocated in the same file or in the directory as the code they are testing, either as a `.test.ts` file with the same name like `someFunction.test.ts` or in a subdirectory named `__tests__`.

To run the unit tests, use the command:

```bash
npm run test
```
