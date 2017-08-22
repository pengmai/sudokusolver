function checkStatus(response) {
  if (response.status === 200 || response.status === 422) {
    return response;
  }
  // Unknown error.
  throwError(response);
}

function parseJSON(response) {
  return response.json();
}

function throwError(response) {
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  //console.log(response); // eslint-disable-line no-console
  throw error;
}

function solve(board) {
  // ES6 function to flatten a multi-dimensional array. Credit:
  // https://gist.github.com/Nishchit14/4c6a7349b3c778f7f97b912629a9f228
  let flatten =
    arr => [].concat.apply([], arr.map(
      element => Array.isArray(element) ? flatten(element) : element));
  var param = flatten(board).join("");
  param = "\"" + param + "\"";
  console.log(param);
  var headers = new Headers({
    "accept": "application/json"
  });
  var init = {method: 'POST', headers: headers, mode: 'cors', body: param};
  var req = new Request('/api/v1/sudokuapi.php?request=solve/', init);
  return fetch(req)
    .then(checkStatus)
    .then(parseJSON)
    .catch(err => ({error: err.response}));
}

const Client = { solve };
export default Client;
