import pandas as pd
import os

# 엑셀 파일에서 의원 이름 읽기
print("엑셀 파일에서 의원 이름 읽기 중...")
df = pd.read_excel('의원검색.xlsx')
member_names = df['의원명'].dropna().astype(str).str.strip().tolist()
print(f"총 {len(member_names)}명의 의원 이름을 찾았습니다.\n")

# image2 폴더의 모든 파일 읽기
print("image2 폴더의 이미지 파일 읽기 중...")
if not os.path.exists('image2'):
    print("image2 폴더가 존재하지 않습니다!")
    exit(1)

image_files = os.listdir('image2')
# 확장자를 제거한 파일명 추출
image_names = []
for file in image_files:
    if file.startswith('.'):  # 숨김 파일 제외
        continue
    # 확장자 제거
    name_without_ext = os.path.splitext(file)[0]
    image_names.append(name_without_ext)

print(f"image2 폴더에 {len(image_names)}개의 이미지가 있습니다.\n")

# 파일명 정규화 함수 (download 스크립트와 동일한 방식)
def normalize_name(name):
    return "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip()

# 이미지가 없는 의원 찾기
missing_members = []
for name in member_names:
    safe_name = normalize_name(name)
    if safe_name not in image_names:
        missing_members.append(name)

# 결과 출력
print("=" * 50)
print("===== 이미지 확인 결과 =====")
print("=" * 50)
print(f"엑셀 파일의 의원 수: {len(member_names)}명")
print(f"다운로드된 이미지 수: {len(image_names)}개")
print(f"이미지 누락된 의원 수: {len(missing_members)}명")

if missing_members:
    print("\n===== 이미지가 없는 의원 목록 =====")
    for idx, name in enumerate(missing_members, 1):
        print(f"  {idx}. {name}")
else:
    print("\n모든 의원의 이미지가 존재합니다!")

print("\n완료!")
