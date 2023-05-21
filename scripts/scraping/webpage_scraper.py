import logging

from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

logger = logging.getLogger(__name__)
title_xpath_locator = (By.XPATH, ".//title")
body_xpath_locator = (By.XPATH, "//html/body")


class WebpageScraper:
    def __init__(self):

        options = Options()
        options.headless = True
        self.driver = Chrome(options=options)

    def load_page(self, url):
        try:
            self.driver.get(url)
            w = WebDriverWait(self.driver, 20)
            # w.until(EC.presence_of_element_located(title_xpath_locator))
            w.until(lambda wd: self.driver.execute_script("return document.readyState") == 'complete', )
        except TimeoutException:
            logger.info(f'Timeout when scraping url: {url}')
            return False
        except WebDriverException as e:
            exception_text = str(e).lower()
            if 'timeout' in exception_text:
                logger.info(f'Timeout when scraping url: {url}')
                return False
            elif 'about:neterror' in exception_text or 'failed to decode response' in exception_text:
                logger.info(f'Failed to load or parse url: {url}')
                return False
            else:
                logger.info(f'Failed to load or parse url: {url}')
                return False
        return True

    def get_page_title(self, url):
        if self.load_page(url):
            return self.driver.title
        else:
            return ''

    def get_page_content(self, url):
        if self.load_page(url):
            return self.driver.find_element(*body_xpath_locator).text
        else:
            return ''


if __name__ == '__main__':
    tst_url = 'https://youtube.com/watch?v=35_rr8Vf-4k'
    title = WebpageScraper().get_page_title(tst_url)
    logger.info(f'got title for url "{tst_url}": {title}')
