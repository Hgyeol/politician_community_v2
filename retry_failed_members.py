from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import requests
import time
import os
import urllib.parse

# image2 폴더가 없으면 생성
if not os.path.exists('image2'):
    os.makedirs('image2')

# 실패한 의원 리스트
failed_members = [
    "김승수", "김영환", "김태선", "조경태", "홍기원", "황희",
    "강경숙", "강득구", "강선영", "강선우", "강승규", "강준현",
    "고민정", "곽상언", "구자근", "권성동", "김건", "김교흥",
    "김기현", "김남근", "김남희", "김미애", "김병주", "김상욱",
    "김상훈", "김선민", "김성원", "김성환", "김성회", "김소희",
    "김영배", "김영진", "김용태", "김윤", "김윤덕", "김재섭",
    "김재원", "김정재", "김종민", "김준형", "김한규", "김현",
    "남인순", "맹성규", "모경종", "문정복", "민병덕", "민형배",
    "민홍철", "박균택", "박상웅", "박성민", "박성준", "박수영",
    "박은정", "박정", "박주민", "박지원", "백승아", "부승찬",
    "서명옥", "서범수", "서영석", "서왕진", "서천호", "성일종",
    "소병훈", "손솔", "송기헌", "송옥주", "신영대", "안상훈",
    "안태준", "어기구", "용혜인", "우원식", "위성곤", "유동수",
    "윤상현", "윤재옥", "윤한홍", "윤호중", "이강일", "이광희",
    "이기헌", "이달희", "이만희", "이병진", "이상식", "이상휘",
    "이소영", "이수진", "이언주", "이연희", "이용선", "이용우",
    "이원택", "이인선", "이재관", "이주희", "이준석", "이철규",
    "이학영", "이해민", "이헌승", "이훈기", "인요한", "임종득",
    "장경태", "장동혁", "전재수", "정동만", "정동영", "정성국",
    "정성호", "정연욱", "정일영", "정진욱", "정청래", "정태호",
    "조계원", "조승환", "조인철", "주호영", "진선미", "진성준",
    "진종오", "최기상", "최수진", "최형두", "한지아", "허영",
    "황명선", "황운하"
]

print(f"실패한 의원 {len(failed_members)}명을 다시 검색합니다.\n")

# 크롬 드라이버 설정
driver = webdriver.Chrome()

# 실패 케이스 추적
still_failed = []
success_count = 0

try:
    for idx, name in enumerate(failed_members, 1):
        print(f"[{idx}/{len(failed_members)}] 국회의원 {name} 검색 중...")

        try:
            # 네이버 검색 URL 생성 - "국회의원 이름"으로 검색
            search_query = f"국회의원 {name}"
            encoded_query = urllib.parse.quote(search_query)
            search_url = f"https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query={encoded_query}"
            driver.get(search_url)

            # 페이지 로딩 대기
            time.sleep(2)

            try:
                # 직업 텍스트 확인 (국회의원인지 체크) - 모든 span 태그에서 찾기
                job_div = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, '/html/body/div[3]/div[2]/div[1]/div[1]/section[1]/div[1]/div[1]/div'))
                )
                job_text = job_div.text.strip()

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
                                still_failed.append(f"{name} - 이미지 다운로드 실패 (HTTP {response.status_code})")
                        else:
                            print(f"  ✗ 이미지 URL을 찾을 수 없습니다")
                            still_failed.append(f"{name} - 이미지 URL 없음")

                    except NoSuchElementException:
                        print(f"  ✗ 이미지 요소를 찾을 수 없습니다")
                        still_failed.append(f"{name} - 이미지 요소 없음")
                    except Exception as e:
                        print(f"  ✗ 이미지 다운로드 중 오류: {e}")
                        still_failed.append(f"{name} - 이미지 다운로드 오류: {e}")
                else:
                    print(f"  ✗ 국회의원이 아닙니다 (직업: {job_text})")
                    still_failed.append(f"{name} - 국회의원 아님 (직업: {job_text})")

            except TimeoutException:
                print(f"  ✗ 검색 결과를 찾을 수 없습니다 (타임아웃)")
                still_failed.append(f"{name} - 검색 결과 없음 (타임아웃)")
            except NoSuchElementException:
                print(f"  ✗ 검색 결과를 찾을 수 없습니다")
                still_failed.append(f"{name} - 검색 결과 없음")

        except Exception as e:
            print(f"  ✗ 처리 중 오류 발생: {e}")
            still_failed.append(f"{name} - 처리 오류: {e}")

        print()  # 빈 줄 추가

finally:
    # 브라우저 종료
    driver.quit()

    # 결과 요약
    print("\n" + "="*50)
    print("===== 재시도 결과 요약 =====")
    print("="*50)
    print(f"재시도 대상: {len(failed_members)}명")
    print(f"성공: {success_count}명")
    print(f"여전히 실패: {len(still_failed)}명")

    if still_failed:
        print("\n===== 여전히 실패한 케이스 =====")
        for case in still_failed:
            print(f"  - {case}")

    print("\n완료!")
