import axios from 'axios';

function newCancelToken() {
  return axios.CancelToken.source();
}

function cancel(token) {
  token.cancel('Operation cancelled by user');
}

function isCancelled(error) {
  return axios.isCancel(error);
}

function solve(board, token) {
  // ES6 function to flatten a multi-dimensional array. Credit:
  // https://gist.github.com/Nishchit14/4c6a7349b3c778f7f97b912629a9f228
  const flatten =
    arr => [].concat.apply([], arr.map(
      element => Array.isArray(element) ? flatten(element) : element));
  const param = flatten(board).join('');

  var config = {
    method: 'POST',
    url: '/api/v1/sudokuapi.php?request=solve',
    headers: {
      'accept': 'application/json',
      'Authorization': 'Basic '+btoa('qauser1:123456')
    },
    data: JSON.stringify(param),
    cancelToken: token.token
  };

  return axios(config).then(response => response.data);
}

const Client = { newCancelToken, cancel, isCancelled, solve };
export default Client;
