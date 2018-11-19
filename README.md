# sudokusolver

A web-based sudoku solver written in TypeScript and React.

The main features of the app are the web based interface with animations powered
by the stellar [React-Motion](https://github.com/chenglou/react-motion)
library.

The backend solver powering the app has undergone a few iterations over the
years, starting with a [PHP solver](https://github.com/pengmai/php-sudokusolver)
that I translated from an assignment from my time taking CSC384: Intro to
Artificial Intelligence. I wasn't satisfied with the performance of that solver,
so I switched it with a slightly modified version of
[Aniket Awati's C++ solver](https://github.com/aniketawati/Sudoku-Solver). That
was excellent until I decided to do away with a server altogether in favour of a
TypeScript translation of
[Pankaj Kumar's JavaScript translation](http://pankaj-k.net/weblog/2007/03/sudoku_solving_program_transla.html)
of [Peter Norvig's Python solver](https://norvig.com/sudoku.html). The solver
runs in a dedicated web worker to prevent blocking the UI thread during long
searches.
