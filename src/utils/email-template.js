export const EmailButton = (text, url) => {
  return `<br />
            <a style="text-decoration: none; color: #fff;" href=${url} target="_blank" rel="nofollow noopener noreferrer">
                <span style="display:block;padding:10px;font-size:18px;background-color:#20A39E;border-radius:5px;width:200px;text-align:center;margin: 25px auto;">
                    ${text}
                </span>
            </a>
        `;
};
