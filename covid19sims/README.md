# COVID-19 Simulations
The following code builds and runs the COVID-19 Simulations webapp.

The app is a static website, using `bokeh` and `JavaScript` via `React.js` to handle interactivity.

All time series solutions for data are saved in the `data.csv` file (TODO: Maybe make this a JSON?).

The `update/` sub-directory contains code for updating the `data.csv` file. This involves re-downloading the data from the JH CSSE GitHub, re-fitting the parameters, and then solving the system again for all various parameter combinations saving the results in `data.csv`.
