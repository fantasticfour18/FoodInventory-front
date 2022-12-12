// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  //restaurant: "62148771e77a130023ba78ce", // (Namaste India Suresh)
  apiBaseUrl: 'https://foodinventoryde-demo.herokuapp.com/v1/',
  //apiBaseUrl: 'http://localhost:3000/v1/',
  cover: 'restaurantService/getRestaurantImage?option=COVER',
  logo: 'restaurantService/getRestaurantImage?option=ICON',
  menuImage: 'menuService/downloadMenuImage',
  socketURL: 'https://foodinventoryde-demo.herokuapp.com',
  //socketURL: 'http://localhost:3000',
  restaurant: "6273613dcec5ef002379dcfd",
  /* restaurant: "62148771e77a130023ba78ce", */
  restaurantPasscode: 'ct12dz',
  //googleAPIkey: 'AIzaSyAhywc-2JvaX6jkQ_r_eTefqVi-Iy5hv08' // mandeep783@gmail.com
  googleAPIkey: 'AIzaSyA7ed5_hrFvMmFVm42R4XlXqD_HPsIy014', //sureshuoh@gmail.com
  //For Singhs Restaurant
  stripeAPIkey: 'pk_test_51LQYVdKlsCyOE8714g8Uf3KqI2Q46ZzCYK3KrcqpujOxOPSdvzVmrGtzB0PuFj87YwOHMQ03ljCBI2oCoHZiOtwq00Bm2sG2t4'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
