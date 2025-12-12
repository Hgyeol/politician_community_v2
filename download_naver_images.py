from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import requests
import time
import os
import pandas as pd

# image2 폴더가 없으면 생성
if not os.path.exists('image2'):
    os.makedirs('image2')

# 엑셀 파일에서 의원 이름 읽기
print("엑셀 파일에서 의원 이름 읽기 중...")
df = pd.read_excel('의원검색.xlsx')

# "의원명" 열에서 이름 추출 (NaN 제외)
member_names = df['의원명'].dropna().astype(str).str.strip().tolist()

print(f"총 {len(member_names)}명의 의원 이름을 찾았습니다.\n")

# 크롬 드라이버 설정
driver = webdriver.Chrome()

# 실패 케이스 추적
failed_cases = []
success_count = 0

try:
    for idx, name in enumerate(member_names, 1):
        print(f"[{idx}/{len(member_names)}] {name} 검색 중...")

        try:
            # 네이버 검색 URL 생성
            search_url = f"https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query={name}"
            driver.get(search_url)

            # 페이지 로딩 대기
            time.sleep(2)

            try:
                # 직업 텍스트 확인 (국회의원인지 체크)
                job_element = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, '/html/body/div[3]/div[2]/div[1]/div[1]/section[1]/div[1]/div[1]/div/span'))
                )
                job_text = job_element.text.strip()

                print(f"  직업: {job_text}")

                if "국회의원" in job_text:
                    # 이미지 다운로드
                    try:
                        img_element = driver.find_element(By.XPATH, '/html/body/div[3]/div[2]/div[1]/div[1]/section[1]/div[2]/div[1]/div/div[2]/a/img')
                        img_url = img_element.get_attribute('src')

                        if img_url:
                            print(f"  이미지 URL: {img_url}")

                            # 이미지 다운로드
                            headers = {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                                'Referer': 'https://search.naver.com/'
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
                                safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip()
                                file_path = f'image2/{safe_name}{file_extension}'

                                with open(file_path, 'wb') as f:
                                    for chunk in response.iter_content(1024):
                                        f.write(chunk)

                                print(f"  ✓ 저장 완료: {file_path}")
                                success_count += 1
                            else:
                                print(f"  ✗ 다운로드 실패 (HTTP {response.status_code})")
                                failed_cases.append(f"{name} - 이미지 다운로드 실패 (HTTP {response.status_code})")
                        else:
                            print(f"  ✗ 이미지 URL을 찾을 수 없습니다")
                            failed_cases.append(f"{name} - 이미지 URL 없음")

                    except NoSuchElementException:
                        print(f"  ✗ 이미지 요소를 찾을 수 없습니다")
                        failed_cases.append(f"{name} - 이미지 요소 없음")
                    except Exception as e:
                        print(f"  ✗ 이미지 다운로드 중 오류: {e}")
                        failed_cases.append(f"{name} - 이미지 다운로드 오류: {e}")
                else:
                    print(f"  ✗ 국회의원이 아닙니다 (직업: {job_text})")
                    failed_cases.append(f"{name} - 국회의원 아님 (직업: {job_text})")

            except TimeoutException:
                print(f"  ✗ 검색 결과를 찾을 수 없습니다 (타임아웃)")
                failed_cases.append(f"{name} - 검색 결과 없음 (타임아웃)")
            except NoSuchElementException:
                print(f"  ✗ 검색 결과를 찾을 수 없습니다")
                failed_cases.append(f"{name} - 검색 결과 없음")

        except Exception as e:
            print(f"  ✗ 처리 중 오류 발생: {e}")
            failed_cases.append(f"{name} - 처리 오류: {e}")

        print()  # 빈 줄 추가

finally:
    # 브라우저 종료
    driver.quit()

    # 결과 요약
    print("\n" + "="*50)
    print("===== 결과 요약 =====")
    print("="*50)
    print(f"총 처리: {len(member_names)}명")
    print(f"성공: {success_count}명")
    print(f"실패: {len(failed_cases)}명")

    if failed_cases:
        print("\n===== 실패한 케이스 =====")
        for case in failed_cases:
            print(f"  - {case}")

    print("\n완료!")
