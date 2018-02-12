import Axios, { CancelTokenSource } from 'axios';

function newCancelToken() {
  return Axios.CancelToken.source();
}

function cancel(token: CancelTokenSource) {
  token.cancel('Operation cancelled by user');
}

function isCancelled(error: Error) {
  return Axios.isCancel(error);
}

function solve(board: number[][], token: CancelTokenSource) {
  // Flatten the array.
  const param = ([] as number[]).concat(...board).join('');

  const config = {
    cancelToken: token.token,
    data: JSON.stringify(param),
    headers: {
      Authorization: 'Basic ' + btoa('qauser1:123456'),
      accept: 'application/json'
    },
    method: 'POST',
    url: '/api/sudokuapi.php?request=solve'
  };

  return Axios(config).then((response) => response.data);
}

const Client = { newCancelToken, cancel, isCancelled, solve };
export default Client;
