from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver import Firefox
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

title_xpath_locator = (By.XPATH, ".//title")


class WebpageTitleScraper:
    def __init__(self):

        options = Options()
        options.headless = True
        self.driver = Firefox(options=options)

    def get_page_title(self, url):
        try:
            self.driver.get(url)
            w = WebDriverWait(self.driver, 10)
            w.until(EC.presence_of_element_located(title_xpath_locator))
        except TimeoutException:
            print("Timeout happened no page load")
            return ''
        except WebDriverException as e:
            exception_text = str(e).lower()
            if 'timeout' in exception_text:
                print("Timeout happened no page load")
                return ''
            elif 'about:neterror' in exception_text:
                print("couldn't load page")
                return ''
            else:
                print(f'failed to scrape url {url}, got exception {e}')
                raise e

        return self.driver.title


if __name__ == '__main__':
    tst_url = 'https://youtube.com/watch?v=35_rr8Vf-4k'
    title = WebTitleScraper().get_page_title(tst_url)
    print(f'got title for url "{tst_url}": {title}')
