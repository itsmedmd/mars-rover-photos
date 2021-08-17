import "styles/global-defaults.scss";
import { Provider } from "react-redux";
import store from "myRedux/store";

const MyApp = ({ Component, pageProps }) => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default MyApp;
