# ISP Documentation for generate_random_string

## Input Domain Model

| Characteristics  | b1            | b2            | b3 |
|------------------|---------------|---------------|-----|
| Relation to Input| x < 0         | x = 0         | x > 0         |
<!-- | Is Random        | Yes           | No            |               |
| ...              | ...           | ...           |               | -->

Note: Already Constrained

## IDM Relabeling Table

| Characteristics | b1  | b2  | b3 |
|-----------------|-----|-----|-----|
| A               | A1  | A2  | A3  |
<!-- | B               | B1  | B2  |     |
| ...             | ... |     |     | -->

## Constraints

- Input berupa angka yang hanya terdiri dari integer atau bilagan bulat
- Hanya menerima satu buah input
<!-- - ... -->

## Test Values and Example I/O

Criteria Used: ACoC

Note: Karena jumlah yang di buat tidak terlalu banyak sehingga dapat dimasukkan semuanya

| Test Value | Example Input | Expected Output |
|------------|---------------|-----------------|
| A1    | -1       | ''        |
| A2    | 0       | ''             |
| A3        | 1           |sebuah string dengan panjang 1|


Tidak ada perubahan karena semua sudah tercover oleh test pada testcase file test_string_utils.py