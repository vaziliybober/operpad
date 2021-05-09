export const withRetry = (callback, delay = 400) =>
  function callbackWithRetryHandling(...params) {
    const retry = async () => {
      try {
        return await callback(...params);
      } catch (error) {
        console.log('Retry because of', error);
        return new Promise((resolve) =>
          setTimeout(() => resolve(retry()), delay),
        );
      }
    };

    return retry();
  };
