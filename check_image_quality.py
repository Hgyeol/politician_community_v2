from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

driver = webdriver.Chrome()

try:
    url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
    driver.get(url)
    time.sleep(3)

    # 사진 보기 버튼 클릭
    photo_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/section/div/article/div/div[2]/div[2]/div[3]/div[2]/div[1]/div/a[2]'))
    )
    photo_button.click()
    time.sleep(2)

    # 첫 번째 의원 정보 확인
    member_list = driver.find_elements(By.XPATH, '/html/body/div[2]/section/div/article/div/div[2]/div[2]/div[3]/div[2]/div[3]/form/div/ul/li')

    if member_list:
        first_member = member_list[0]

        # 현재 썸네일 이미지 URL
        img_element = first_member.find_element(By.XPATH, './/a/div/img')
        thumb_url = img_element.get_attribute('src')
        print(f"썸네일 URL: {thumb_url}")

        # 이미지의 실제 크기 확인
        width = img_element.get_attribute('width')
        height = img_element.get_attribute('height')
        print(f"이미지 크기: {width}x{height}")

        # 링크를 클릭해서 상세 페이지로 이동
        link = first_member.find_element(By.XPATH, './/a')
        link_href = link.get_attribute('href')
        print(f"\n상세 페이지 URL: {link_href}")

        # 상세 페이지로 이동
        link.click()
        time.sleep(3)

        # 상세 페이지에서 더 큰 이미지 찾기
        try:
            # 다양한 경로로 이미지 찾기
            images = driver.find_elements(By.TAG_NAME, 'img')
            print(f"\n상세 페이지의 이미지 개수: {len(images)}")

            for idx, img in enumerate(images[:10]):  # 처음 10개만
                src = img.get_attribute('src')
                if src and ('member' in src.lower() or 'photo' in src.lower() or 'thumb' in src.lower() or '.jpg' in src.lower() or '.png' in src.lower()):
                    print(f"\n이미지 {idx+1}:")
                    print(f"  URL: {src}")
                    print(f"  naturalWidth: {driver.execute_script('return arguments[0].naturalWidth', img)}")
                    print(f"  naturalHeight: {driver.execute_script('return arguments[0].naturalHeight', img)}")
        except Exception as e:
            print(f"상세 페이지 이미지 찾기 실패: {e}")

finally:
    driver.quit()
