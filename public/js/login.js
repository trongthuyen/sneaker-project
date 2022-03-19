/* eslint-disable */

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    console.log(res);
    if (res.data.status === 'success') {
      //   callAlert('success', 'Login successfuly');
      window.setTimeout(() => {
        // location.assign('/product-details/620f8f205896d00454b8feef');
        location.assign('/product-detail.html');
      }, 1000);
    }
  } catch (err) {
    // callAlert('error', err.response.data.message);
    // console.log(err);
    console.log(err.response.data.message);
  }
};

// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: 'http://127.0.0.1:3000/api/v1/users/logout'
//     });
//     //  location.reload option true will force the server to load a page again, if not use
//     //  this option, browser will reload with resource storing in cache.
//     console.log(res);
//     if (res.data.status === 'success') {
//       location.reload(true);
//     }
//   } catch (err) {
//     callAlert('error', 'Error when logout ! Please try again');
//   }
// };

const loginForm = document.querySelector('.login__form');

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.querySelector('.form__email').value;
  const password = document.querySelector('.form__password').value;
  login(email, password);
});
