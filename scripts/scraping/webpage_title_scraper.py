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
        # self.driver.implicitly_wait(10)

    def get_page_title(self, url):
        self.driver.get(url)

        try:
            w = WebDriverWait(self.driver, 10)
            w.until(EC.presence_of_element_located(title_xpath_locator))
            print("Page load happened")
        except TimeoutException:
            print("Timeout happened no page load")
            return ''
        except WebDriverException as e:
            if 'timeout' in str(e).lower():
                return ''
            else:
                print(f'failed to scrape url {url}, got exception {e}')
                raise e

        title = self.driver.title
        return title


if __name__ == '__main__':
    #     title = WebTitleScraper().get_page_title('https://youtube.com/watch?v=35_rr8Vf-4k')
    title = WebpageTitleScraper().get_page_title('https://twitter.com/OrangeDAOxyz/status/1517218640046792708/photo/1')
    print('got title', title)
