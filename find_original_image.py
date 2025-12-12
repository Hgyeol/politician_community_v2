from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import requests

driver = webdriver.Chrome()

try:
    url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
    driver.get(url)
    time.sleep(3)

    # 사진 보기 버튼 클릭
    photo_button = driver.find_element(By.XPATH, '/html/body/div[2]/section/div/article/div/div[2]/div[2]/div[3]/div[2]/div[1]/div/a[2]')
    photo_button.click()
    time.sleep(2)

    # 첫 번째 의원 확인
    member = driver.find_element(By.XPATH, '/html/body/div[2]/section/div/article/div/div[2]/div[2]/div[3]/div[2]/div[3]/form/div/ul/li[1]')

    # 썸네일 URL
    img_element = member.find_element(By.XPATH, './/a/div/img')
    thumb_url = img_element.get_attribute('src')
    print(f"썸네일 URL: {thumb_url}")
    print(f"파일명: {thumb_url.split('/')[-1]}")

    # URL 패턴 분석 - thumb를 다른 것으로 바꿔보기
    possible_urls = [
        thumb_url,  # 원본
        thumb_url.replace('/thumb/', '/'),  # thumb 폴더 제거
        thumb_url.replace('/thumb/', '/original/'),  # original 폴더
        thumb_url.replace('/thumb/', '/large/'),  # large 폴더
        thumb_url.replace('/new/thumb/', '/new/'),  # new/thumb -> new
    ]

    print("\n=== 가능한 URL 테스트 ===")
    for test_url in possible_urls:
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://open.assembly.go.kr/'
            }
            response = requests.head(test_url, headers=headers, timeout=5)
            if response.status_code == 200:
                print(f"\n✓ 성공: {test_url}")
                print(f"  Status: {response.status_code}")
                if 'content-length' in response.headers:
                    size = int(response.headers['content-length'])
                    print(f"  Size: {size:,} bytes ({size/1024:.1f} KB)")
            else:
                print(f"✗ 실패 ({response.status_code}): {test_url}")
        except Exception as e:
            print(f"✗ 오류: {test_url} - {e}")

    # 상세 페이지로 이동해서 확인
    print("\n=== 상세 페이지 확인 ===")
    link = member.find_element(By.XPATH, './/a')
    detail_url = link.get_attribute('href')
    print(f"상세 페이지: {detail_url}")

    driver.get(detail_url)
    time.sleep(3)

    # 상세 페이지의 모든 이미지 확인
    images = driver.find_elements(By.TAG_NAME, 'img')
    print(f"\n이미지 개수: {len(images)}")

    for idx, img in enumerate(images):
        src = img.get_attribute('src')
        if src and ('.jpg' in src.lower() or '.png' in src.lower()):
            natural_width = driver.execute_script('return arguments[0].naturalWidth', img)
            natural_height = driver.execute_script('return arguments[0].naturalHeight', img)
            if natural_width > 100:  # 작은 아이콘 제외
                print(f"\n이미지 {idx+1}:")
                print(f"  URL: {src}")
                print(f"  크기: {natural_width}x{natural_height}")

finally:
    driver.quit()
