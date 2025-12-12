from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import requests
import time
import os

# image 폴더가 없으면 생성
if not os.path.exists('image'):
    os.makedirs('image')

# 크롬 드라이버 설정
driver = webdriver.Chrome()

try:
    # 국회 의원 검색 페이지 접속
    url = "https://open.assembly.go.kr/portal/assm/search/memberSchPage.do"
    driver.get(url)

    # 페이지 로딩 대기
    time.sleep(3)

    # 사진 보기 버튼 클릭
    print("사진 보기 버튼 클릭 중...")
    photo_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/section/div/article/div/div[2]/div[2]/div[3]/div[2]/div[1]/div/a[2]'))
    )
    photo_button.click()
    time.sleep(2)
    print("✓ 사진 보기 모드로 전환 완료\n")

    # 1번부터 10번까지 페이지 순회
    for page_num in range(1, 11):
        print(f"\n===== 페이지 {page_num} 처리 중 =====")

        try:
            # 의원 목록이 로드될 때까지 대기
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '/html/body/div[2]/section/div/article/div/div[2]/div[2]/div[3]/div[2]/div[3]/form/div/ul'))
            )

            # 현재 페이지의 모든 의원 항목 가져오기
            member_list = driver.find_elements(By.XPATH, '/html/body/div[2]/section/div/article/div/div[2]/div[2]/div[3]/div[2]/div[3]/form/div/ul/li')

            print(f"현재 페이지의 의원 수: {len(member_list)}")

            # 각 의원의 이미지 다운로드
            for idx, member in enumerate(member_list, 1):
                try:
                    # 이미지 URL 가져오기
                    img_element = member.find_element(By.XPATH, f'.//a/div/img')
                    img_url = img_element.get_attribute('src')

                    # 의원 이름 가져오기
                    name_element = member.find_element(By.XPATH, f'.//a/span')
                    member_name = name_element.text.strip()

                    if member_name and img_url:
                        print(f"  [{idx}] {member_name} 이미지 다운로드 중...")

                        # 이미지 다운로드 (헤더 추가)
                        headers = {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Referer': 'https://open.assembly.go.kr/'
                        }
                        response = requests.get(img_url, headers=headers, stream=True)
                        if response.status_code == 200:
                            # 파일 확장자 추출 (기본값 .jpg)
                            file_extension = '.jpg'
                            if '.' in img_url:
                                ext = img_url.split('.')[-1].split('?')[0]
                                if ext.lower() in ['jpg', 'jpeg', 'png', 'gif']:
                                    file_extension = f'.{ext}'

                            # 파일명에서 사용할 수 없는 문자 제거
                            safe_name = "".join(c for c in member_name if c.isalnum() or c in (' ', '-', '_')).strip()
                            file_path = f'image/{safe_name}{file_extension}'

                            with open(file_path, 'wb') as f:
                                for chunk in response.iter_content(1024):
                                    f.write(chunk)
                            print(f"      ✓ 저장 완료: {file_path}")
                        else:
                            print(f"      ✗ 다운로드 실패 (HTTP {response.status_code})")

                except Exception as e:
                    print(f"  ✗ 의원 정보 추출 실패: {e}")
                    continue

            # 다음 페이지로 이동 (10페이지가 아닐 경우)
            if page_num < 10:
                try:
                    # 페이지네이션에서 다음 페이지 번호 클릭
                    next_page_xpath = f'/html/body/div[2]/section/div/article/div/div[2]/div[2]/div[3]/div[2]/div[3]/form/div/div/div/a[text()="{page_num + 1}"]'
                    next_button = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, next_page_xpath))
                    )
                    next_button.click()

                    # 페이지 로딩 대기
                    time.sleep(2)

                except Exception as e:
                    print(f"다음 페이지 버튼을 찾을 수 없습니다: {e}")
                    break

        except TimeoutException:
            print(f"페이지 {page_num} 로딩 시간 초과")
            break
        except Exception as e:
            print(f"페이지 {page_num} 처리 중 오류 발생: {e}")
            break

finally:
    # 브라우저 종료
    driver.quit()
    print("\n===== 완료 =====")
