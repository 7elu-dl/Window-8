// ゲーム状態管理
const gameState = {
    currentWindow: 1,
    maxWindow: 8,
    currentDocument: null,
    corrections: [],
    loopCount: 0,
    submittedDocuments: [], // 提出済みの書類を保存（プレイヤーが参照可能）
    playerInfo: {
        // 建築主情報
        ownerName: '青山太一',
        ownerNameWithSpace: '青山 太一',
        ownerKana: 'アオヤマ タイチ',
        ownerAddress: '例示県例示市緑町一丁目2番3号',
        ownerAddressSimple: '例示県例示市緑町1-2-3',
        ownerPhone: '0XX-1234-5678',

        // 設計者情報
        designerName: 'アトリエ建築設計 株式会社',
        designerNameShort: 'アトリエ建築(株)',
        designerRepresentative: '佐藤健二',
        designerRepresentativeWithSpace: '佐藤 健二',
        designerLicenseNumber: '一級建築士 第123456号',
        designerAddress: '例示県例示市桜台二丁目1番1号',
        designerPhone: '0XX-5678-1234',

        // 構造設計者情報
        structuralDesigner: '構造設計パートナーズ 株式会社',
        structuralDesignerShort: '構造P(株)',
        structuralEngineer: '高橋誠',
        structuralEngineerWithSpace: '高橋 誠',
        structuralLicense: '構造設計一級建築士 第789012号',
        structuralPhone: '0XX-9012-3456',

        // 建築物の基本情報
        buildingLocation: '例示県例示市緑町一丁目2番3号',
        buildingLocationSimple: '例示県例示市緑町1-2-3',
        buildingUse: '一戸建ての住宅',
        buildingUseCode: '専用住宅（建築基準法別表第2（い）項第1号）',
        buildingStructure: '木造',
        structureDetail: '木造在来軸組工法2階建',

        // 敷地・地域地区情報
        siteArea: '200.00', // 敷地面積（m²）
        siteAreaFormatted: '200.00㎡',
        useDistrict: '第一種低層住居専用地域',
        fireDistrict: '準防火地域',

        // 道路情報
        roadType: '建築基準法第42条第1項第1号',
        roadWidth: '6.00', // 道路幅員（m）
        roadWidthFormatted: '6.00m',
        frontage: '8.00', // 間口（m）
        frontageFormatted: '8.00m',

        // 建築面積
        buildingArea: '100.00', // 建築面積（m²）
        buildingAreaFormatted: '100.00㎡',
        buildingCoverageRatio: '50.00', // 建ぺい率（%）
        buildingCoverageRatioLimit: '60', // 建ぺい率制限

        // 延床面積
        totalFloorArea: '180.00', // 延床面積（m²）
        totalFloorAreaFormatted: '180.00㎡',
        floorAreaRatio: '90.00', // 容積率（%）
        floorAreaRatioLimit: '200', // 容積率制限

        // 各階面積
        firstFloorArea: '100.00', // 1階床面積
        secondFloorArea: '80.00', // 2階床面積

        // 高さ情報
        buildingHeight: '9.50', // 建築物の高さ（m）
        buildingHeightFormatted: '9.50m',
        eaveHeight: '7.20', // 軒の高さ（m）
        eaveHeightFormatted: '7.20m',
        floors: '地上2階',
        floorsNumber: '2',

        // 法適合性
        northSideSetback: '1.00', // 北側斜線後退距離（m）
        northSideSetbackFormatted: '1.00m',

        // 日付情報
        preConsultationDate: '令和6年8月15日', // 事前協議日
        applicationDate: '令和6年9月1日', // 申請日
        designDate: '令和6年8月30日', // 設計図書作成日
        structuralCalcDate: '令和6年8月28日', // 構造計算書作成日

        // 手数料計算
        applicationFee: '18000', // 申請手数料（円）
        applicationFeeFormatted: '18,000円',
        feeCalculationBasis: '延べ面積180㎡（200㎡以下）'
    }
};



// 書類データベース（8つの窓口に対応）
// 建築確認申請に必要な書類を論理的な順序で配置
const documents = {
    1: {
        name: '建築確認申請書（第一面）',
        theme: '建築確認申請',
        hint: '建築主、設計者、建築物の基本情報が正しく記載されているか確認してください',
        type: 'application',
        fields: [
            { type: 'header', label: '申請日', value: '令和6年9月1日', anomalies: ['令和6年9月01日', '令和6年8月1日'] },
            { type: 'section-title', label: '第一　建築主' },
            { type: 'field', label: 'イ フリガナ', value: 'アオヤマ タイチ', anomalies: ['アオヤマタイチ', 'アオヤマ  タイチ'] },
            { type: 'field', label: 'ロ 氏名', value: '青山 太一', anomalies: ['青山太一', '青山 太市'] },
            { type: 'field', label: 'ハ 郵便番号', value: '000-0000', anomalies: ['000-000', '0000000'] },
            { type: 'field', label: 'ニ 住所', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1丁目2番3号', '例示県例示市緑町一丁目2番'] },
            { type: 'field', label: 'ホ 電話番号', value: '0XX-1234-5678', anomalies: ['0XX-1243-5678', 'XX-1234-5678'] },
            { type: 'section-title', label: '第二　設計者' },
            { type: 'field', label: 'イ 資格', value: '一級建築士', anomalies: ['建築士', '1級建築士'] },
            { type: 'field', label: 'ロ 氏名', value: '佐藤 健二', anomalies: ['佐藤健二', '佐藤 健二 一級建築士'] },
            { type: 'field', label: 'ハ 登録番号', value: '第123456号', anomalies: ['123456号', '第12345号'] },
            { type: 'field', label: 'ニ 事務所名称', value: 'アトリエ建築設計 株式会社', anomalies: ['アトリエ建築設計(株)', 'アトリエ建築設計株式会社'] },
            { type: 'field', label: 'ホ 電話番号', value: '0XX-5678-1234', anomalies: ['0XX-5687-1234', 'XX-5678-1234'] },
            { type: 'section-title', label: '第三　建築物の概要' },
            { type: 'field', label: 'イ 建築場所', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1-2-3', '例示県例示市緑町一丁目2番3'] },
            { type: 'field', label: 'ロ 用途', value: '一戸建ての住宅（専用住宅）', anomalies: ['一戸建ての住宅', '専用住宅', '店舗併用住宅（専用住宅）', 'コンビニエンスストア'] },
            { type: 'field', label: 'ハ 構造', value: '木造在来軸組工法', anomalies: ['木造', 'W造', '木造2階建'] },
            { type: 'field', label: 'ニ 階数', value: '地上2階', anomalies: ['2階', '地上2階建', '地上3階'] },
            { type: 'field', label: 'ホ 敷地面積', value: '200.00㎡', anomalies: ['200㎡', '200.0㎡', '150.00㎡', '20.00㎡'] },
            { type: 'field', label: 'ヘ 建築面積', value: '100.00㎡', anomalies: ['100㎡', '100.0㎡', '130.00㎡', '10.00㎡'] },
            { type: 'field', label: 'ト 延べ面積', value: '180.00㎡', anomalies: ['180㎡', '180.0㎡', '220.00㎡', '18.00㎡'] },
            { type: 'field', label: 'チ 最高高さ', value: '9.50m', anomalies: ['9.5m', '9.50メートル', '10.50m', '13.00m'] },
            { type: 'section-title', label: '第四　地域地区' },
            { type: 'field', label: 'イ 用途地域', value: '第一種低層住居専用地域', anomalies: ['低層住居専用地域', '第一種住居地域'] },
            { type: 'field', label: 'ロ 防火地域', value: '準防火地域', anomalies: ['防火地域', '準防火'] }
        ]
    },
    2: {
        name: '建築計画概要書',
        theme: '建築計画の概要',
        hint: '敷地面積、建築面積、延床面積、建ぺい率、容積率、用途地域を確認してください',
        type: 'summary',
        fields: [
            { type: 'header', label: '作成日', value: '令和6年9月1日', anomalies: ['令和6年8月1日', '令和6年9月1'] },
            { type: 'section-title', label: '建築主' },
            { type: 'field', label: '氏名', value: '青山 太一', anomalies: ['青山太一', '青山 太一様'] },
            { type: 'field', label: '住所', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1丁目2番3号', '例示県例示市緑町一丁目2-3'] },
            { type: 'field', label: '電話番号', value: '0XX-1234-5678', anomalies: ['0XX-1243-5678', 'XX-1234-5678'] },
            { type: 'section-title', label: '設計者' },
            { type: 'field', label: '事務所名', value: 'アトリエ建築設計 株式会社', anomalies: ['アトリエ建築(株)', 'アトリエ建築設計株式会社'] },
            { type: 'field', label: '氏名', value: '佐藤 健二', anomalies: ['佐藤健二', '一級建築士 佐藤健二'] },
            { type: 'field', label: '資格', value: '一級建築士 第123456号', anomalies: ['一級建築士第123456号', '一級建築士 123456号'] },
            { type: 'section-title', label: '地域地区' },
            { type: 'field', label: '用途地域', value: '第一種低層住居専用地域', anomalies: ['第一種住居地域', '低層住居専用地域'] },
            { type: 'field', label: '防火地域', value: '準防火地域', anomalies: ['防火地域', '準防火'] },
            { type: 'section-title', label: '敷地及び建築物の概要' },
            { type: 'field', label: '建築場所', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1-2-3', '例示県例示市緑町一丁目2番3', '例示県例示市緑町二丁目2番3号'] },
            { type: 'field', label: '敷地面積', value: '200.00㎡', anomalies: ['200㎡', '200.0㎡', '150.00㎡'] },
            { type: 'field', label: '建築面積', value: '100.00㎡', anomalies: ['100㎡', '10.00㎡', '130.00㎡'] },
            { type: 'field', label: '延べ面積', value: '180.00㎡', anomalies: ['180㎡', '180.0㎡', '450.00㎡'] },
            { type: 'field', label: '建ぺい率', value: '50.00%（制限60%）', anomalies: ['50%', '50.00%（60%）', '65.00%（制限60%）', '50.00%（制限50%）'] },
            { type: 'field', label: '容積率', value: '90.00%（制限200%）', anomalies: ['90%', '90.00%（200%）', '225.00%（制限200%）', '90.00%（制限80%）'] },
            { type: 'field', label: '構造', value: '木造在来軸組工法', anomalies: ['木造2階建', '木造', '鉄筋コンクリート造'] },
            { type: 'field', label: '階数', value: '地上2階', anomalies: ['2階', '地上2階建', '地上3階', '地上5階'] },
            { type: 'field', label: '最高高さ', value: '9.50m', anomalies: ['9.5m', '9.50メートル', '11.50m', '15.00m'] }
        ]
    },
    3: {
        name: '配置図',
        theme: '敷地と建物の配置',
        hint: '敷地面積、建築面積、建ぺい率、道路幅員、接道状況を確認してください',
        type: 'layout',
        fields: [
            { type: 'header', label: '図面名称', value: '配置図', anomalies: ['配置', '配置平面図'] },
            { type: 'field', label: '縮尺', value: 'S=1/100', anomalies: ['1/100', '1:100'] },
            { type: 'field', label: '方位', value: '真北', anomalies: ['北', 'N'] },
            { type: 'field', label: '作成日', value: '令和6年8月30日', anomalies: ['令和6年8月3日', '令和6年8月30'] },
            { type: 'section-title', label: '物件概要' },
            { type: 'field', label: '建築主', value: '青山 太一', anomalies: ['青山太一', '青山 太一 様'] },
            { type: 'field', label: '所在地', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1-2-3', '例示県例示市緑町一丁目2番3'] },
            { type: 'field', label: '用途', value: '一戸建ての住宅（専用住宅）', anomalies: ['一戸建ての住宅', '専用住宅', 'コンビニエンスストア'] },
            { type: 'section-title', label: '地域地区' },
            { type: 'field', label: '用途地域', value: '第一種低層住居専用地域', anomalies: ['第一種住居地域', '低層住居専用地域'] },
            { type: 'field', label: '防火地域', value: '準防火地域', anomalies: ['防火地域', '準防火'] },
            { type: 'section-title', label: '敷地求積表' },
            { type: 'field', label: '敷地面積', value: '200.00㎡', anomalies: ['200.0㎡', '200㎡', '150.00㎡'] },
            { type: 'section-title', label: '道路（建築基準法第42条）' },
            { type: 'field', label: '南側道路', value: '第42条第1項第1号道路（市道）', anomalies: ['第42条1項1号', '市道'] },
            { type: 'field', label: '幅員', value: '6.00m', anomalies: ['6m', '6.0m', '3.50m'] },
            { type: 'field', label: '接道長さ', value: '8.00m', anomalies: ['8m', '8.0m', '1.80m'] },
            { type: 'section-title', label: '建築面積求積表' },
            { type: 'field', label: '建築面積', value: '100.00㎡', anomalies: ['100.0㎡', '100㎡', '130.00㎡'] },
            { type: 'field', label: '建ぺい率', value: '50.00%（100.00/200.00）', anomalies: ['50%', '50.00%', '65.00%（130.00/200.00）'] },
            { type: 'field', label: '建ぺい率制限', value: '60%', anomalies: ['50%', '60.0%'] },
            { type: 'section-title', label: '建築物' },
            { type: 'field', label: '構造', value: '木造在来軸組工法', anomalies: ['木造', 'W造'] },
            { type: 'field', label: '階数', value: '地上2階', anomalies: ['2階', '地上2階建', '地上3階'] },
            { type: 'field', label: '北側後退距離', value: '1.00m', anomalies: ['1m', '1.0m', '0.50m'] },
            { type: 'section-title', label: '設計' },
            { type: 'field', label: '設計事務所', value: 'アトリエ建築設計 株式会社', anomalies: ['アトリエ建築(株)', 'アトリエ建築設計株式会社'] },
            { type: 'field', label: '一級建築士', value: '佐藤 健二 第123456号', anomalies: ['佐藤 健二', '佐藤健二'] }
        ]
    },
    4: {
        name: '各階平面図',
        theme: '階ごとの面積',
        hint: '1階と2階の床面積の合計が延床面積と一致するか確認してください',
        type: 'floor-plan',
        fields: [
            { type: 'header', label: '図面名称', value: '各階平面図', anomalies: ['平面図', '1階・2階平面図'] },
            { type: 'field', label: '縮尺', value: 'S=1/100', anomalies: ['1/100', '1:100'] },
            { type: 'field', label: '作成日', value: '令和6年8月30日', anomalies: ['令和6年8月3日', '令和6年9月30日'] },
            { type: 'section-title', label: '物件概要' },
            { type: 'field', label: '建築主', value: '青山 太一', anomalies: ['青山太一', '青山 太一 様'] },
            { type: 'field', label: '所在地', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1-2-3', '例示県例示市緑町一丁目2番3'] },
            { type: 'field', label: '用途', value: '一戸建ての住宅（専用住宅）', anomalies: ['一戸建ての住宅', '専用住宅', 'コンビニエンスストア'] },
            { type: 'field', label: '構造', value: '木造在来軸組工法', anomalies: ['木造', '木造2階建'] },
            { type: 'field', label: '階数', value: '地上2階', anomalies: ['2階', '地上2階建', '地上3階'] },
            { type: 'section-title', label: '1階平面図' },
            { type: 'field', label: '主要室', value: 'LDK、玄関、浴室、洗面所、トイレ', anomalies: ['LDK・玄関・浴室・洗面所・トイレ', 'リビング、キッチン、浴室', 'LDK、店舗、玄関、トイレ'] },
            { type: 'field', label: '1階床面積', value: '100.00㎡', anomalies: ['100.0㎡', '10.00㎡', '120.00㎡'] },
            { type: 'section-title', label: '2階平面図' },
            { type: 'field', label: '主要室', value: '主寝室、洋室1、洋室2、トイレ、階段ホール', anomalies: ['寝室、洋室×2、トイレ', '主寝室・洋室1・洋室2・トイレ'] },
            { type: 'field', label: '2階床面積', value: '80.00㎡', anomalies: ['80.0㎡', '8.00㎡', '105.00㎡'] },
            { type: 'section-title', label: '床面積求積表' },
            { type: 'field', label: '延べ面積', value: '180.00㎡（1階100.00+2階80.00）', anomalies: ['180.0㎡', '180㎡', '225.00㎡（1階120.00+2階105.00）', '450.00㎡（1階225.00+2階225.00）'] },
            { type: 'field', label: '容積率', value: '90.00%（180.00/200.00）', anomalies: ['90%', '90.0%', '112.50%（225.00/200.00）', '225.00%（450.00/200.00）'] },
            { type: 'field', label: '容積率制限', value: '200%', anomalies: ['90%', '200.0%'] },
            { type: 'section-title', label: '設計' },
            { type: 'field', label: '設計事務所', value: 'アトリエ建築設計 株式会社', anomalies: ['アトリエ建築(株)', 'アトリエ建築設計株式会社'] },
            { type: 'field', label: '一級建築士', value: '佐藤 健二 第123456号', anomalies: ['佐藤 健二', '佐藤健二'] }
        ]
    },
    5: {
        name: '立面図',
        theme: '建物の高さ',
        hint: '建築物の高さ、軒の高さ、階数、高さ制限適合性を確認してください',
        type: 'elevation',
        fields: [
            { type: 'header', label: '図面名称', value: '立面図（東西南北）', anomalies: ['立面図', '東西南北立面図'] },
            { type: 'field', label: '縮尺', value: 'S=1/100', anomalies: ['1/100', '1/200'] },
            { type: 'field', label: '作成日', value: '令和6年8月30日', anomalies: ['令和6年8月3日', '令和6年8月'] },
            { type: 'section-title', label: '物件概要' },
            { type: 'field', label: '建築主', value: '青山 太一', anomalies: ['青山太一', '青山 太一 様'] },
            { type: 'field', label: '所在地', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1-2-3', '例示県例示市緑町一丁目2番3'] },
            { type: 'field', label: '用途', value: '一戸建ての住宅（専用住宅）', anomalies: ['一戸建ての住宅', '専用住宅', 'コンビニエンスストア'] },
            { type: 'section-title', label: '法規制' },
            { type: 'field', label: '用途地域', value: '第一種低層住居専用地域', anomalies: ['第一種住居地域', '低層住居専用地域'] },
            { type: 'field', label: '絶対高さ制限', value: '10m以下', anomalies: ['12m以下', '10m'] },
            { type: 'field', label: '北側斜線制限', value: '真北方向L×1.25+5m', anomalies: ['L×1.25+5m', '1.25+5m'] },
            { type: 'section-title', label: '高さ関係' },
            { type: 'field', label: '最高高さ（GL+）', value: '9.50m', anomalies: ['9.5m', '9.50メートル', '11.50m', '13.00m'] },
            { type: 'field', label: '最高軒高（GL+）', value: '7.20m', anomalies: ['7.2m', '7.20メートル', '8.50m'] },
            { type: 'field', label: '1階天井高', value: '2.50m', anomalies: ['2.5m', '2500mm'] },
            { type: 'field', label: '2階天井高', value: '2.40m', anomalies: ['2.4m', '2400mm'] },
            { type: 'section-title', label: '法適合性確認' },
            { type: 'field', label: '絶対高さ', value: '適合（9.50m＜10m）', anomalies: ['適合', '9.50m＜10m', '不適合（11.50m＞10m）', '不適合（13.00m＞10m）'] },
            { type: 'field', label: '北側斜線', value: '適合（北側後退1.00m）', anomalies: ['適合', '北側斜線 適合', '不適合（後退不足）'] },
            { type: 'section-title', label: '構造' },
            { type: 'field', label: '構造', value: '木造在来軸組工法', anomalies: ['木造', 'W造'] },
            { type: 'field', label: '階数', value: '地上2階', anomalies: ['2階', '地上2階建', '地上3階'] },
            { type: 'section-title', label: '設計' },
            { type: 'field', label: '設計事務所', value: 'アトリエ建築設計 株式会社', anomalies: ['アトリエ建築(株)', 'アトリエ建築設計株式会社'] },
            { type: 'field', label: '一級建築士', value: '佐藤 健二 第123456号', anomalies: ['佐藤健二 第123456号', '佐藤 健二'] }
        ]
    },
    6: {
        name: '構造計算書表紙',
        theme: '構造設計',
        hint: '構造設計者の情報、建築物の基本情報、構造仕様を確認してください',
        type: 'structural',
        fields: [
            { type: 'header', label: '書類名称', value: '構造計算書', anomalies: ['構造計算', '構造設計書'] },
            { type: 'field', label: '作成日', value: '令和6年8月28日', anomalies: ['令和6年8月2日', '令和6年8月30日'] },
            { type: 'section-title', label: '物件概要' },
            { type: 'field', label: '物件名', value: '青山邸新築工事', anomalies: ['青山様邸', '青山太一邸'] },
            { type: 'field', label: '建築場所', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1-2-3', '例示県例示市緑町一丁目2番3'] },
            { type: 'field', label: '建築主', value: '青山 太一', anomalies: ['青山太一', '青山 太一 様'] },
            { type: 'section-title', label: '建築物概要' },
            { type: 'field', label: '用途', value: '一戸建ての住宅（専用住宅）', anomalies: ['一戸建ての住宅', '専用住宅', 'コンビニエンスストア'] },
            { type: 'field', label: '構造・規模', value: '木造在来軸組工法 地上2階建', anomalies: ['木造2階建', '木造在来軸組工法2階建', '木造在来軸組工法 地上3階建', '木造在来軸組工法 地上5階建'] },
            { type: 'field', label: '建築面積', value: '100.00㎡', anomalies: ['100㎡', '100.0㎡', '130.00㎡'] },
            { type: 'field', label: '延べ面積', value: '180.00㎡', anomalies: ['180㎡', '180.0㎡', '450.00㎡', '550.00㎡'] },
            { type: 'field', label: '最高高さ', value: '9.50m', anomalies: ['9.5m', '9.50', '11.50m', '13.00m'] },
            { type: 'section-title', label: '構造設計方針' },
            { type: 'field', label: '構造種別', value: '木造（在来軸組工法）', anomalies: ['木造', 'W造'] },
            { type: 'field', label: '基礎形式', value: 'べた基礎（鉄筋コンクリート造）', anomalies: ['べた基礎', 'RC造べた基礎'] },
            { type: 'field', label: '耐力壁', value: '筋かい耐力壁', anomalies: ['筋交い', '筋かい'] },
            { type: 'field', label: '構造計算方法', value: '仕様規定（壁量計算）', anomalies: ['壁量計算', '仕様規定による', '構造計算（許容応力度計算）'] },
            { type: 'section-title', label: '構造設計者' },
            { type: 'field', label: '会社名', value: '構造設計パートナーズ 株式会社', anomalies: ['構造P(株)', '構造設計パートナーズ株式会社'] },
            { type: 'field', label: '担当者氏名', value: '高橋 誠', anomalies: ['高橋誠', '高橋 誠 構造設計一級建築士'] },
            { type: 'field', label: '資格', value: '構造設計一級建築士 第789012号', anomalies: ['構造設計一級建築士第789012号', '構造一級建築士 第789012号'] },
            { type: 'field', label: '電話番号', value: '0XX-9012-3456', anomalies: ['0XX-9021-3456', 'XX-9012-3456'] }
        ]
    },
    7: {
        name: '建築主事前協議記録',
        theme: '事前協議',
        hint: '事前協議の日付と内容を確認してください',
        type: 'consultation',
        fields: [
            { type: 'header', label: '協議日', value: '令和6年8月15日', anomalies: ['令和6年8月1日', '令和6年8月15', '令和6年9月15日'] }, // 申請前
            { type: 'section-title', label: '建築主' },
            { type: 'field', label: '氏名', value: '青山 太一', anomalies: ['青山太一', '青山 太一様'] },
            { type: 'field', label: '電話番号', value: '0XX-1234-5678', anomalies: ['0XX-1243-5678', 'XX-1234-5678'] },
            { type: 'section-title', label: '建築計画' },
            { type: 'field', label: '建築場所', value: '例示県例示市緑町一丁目2番3号', anomalies: ['例示県例示市緑町1丁目2番3号', '例示県例示市緑町一丁目2-3'] },
            { type: 'field', label: '用途', value: '一戸建ての住宅', anomalies: ['専用住宅', '一戸建住宅', 'コンビニエンスストア'] },
            { type: 'field', label: '規模', value: '木造2階建', anomalies: ['木造 地上2階', '木造・2階建', '木造3階建', '木造5階建'] },
            { type: 'field', label: '延べ面積', value: '180.00㎡', anomalies: ['180㎡', '約180㎡', '450.00㎡', '550.00㎡'] },
            { type: 'section-title', label: '設計者' },
            { type: 'field', label: '設計事務所', value: 'アトリエ建築設計 株式会社', anomalies: ['アトリエ建築(株)', 'アトリエ建築設計株式会社'] },
            { type: 'field', label: '連絡先', value: '0XX-5678-1234', anomalies: ['0XX-5687-1234', 'XX-5678-1234'] }
        ]
    },
    8: {
        name: '確認申請手数料計算書',
        theme: '手数料計算',
        hint: '延べ面積に基づく手数料が正しく計算されているか確認してください',
        type: 'fee',
        fields: [
            { type: 'header', label: '算定日', value: '令和6年9月1日', anomalies: ['令和6年9月01日', '令和6年8月1日'] },
            { type: 'section-title', label: '建築主' },
            { type: 'field', label: '氏名', value: '青山 太一', anomalies: ['青山太一', '青山 太市'] },
            { type: 'section-title', label: '建築物の概要' },
            { type: 'field', label: '用途', value: '一戸建ての住宅', anomalies: ['専用住宅', '一戸建て住宅', 'コンビニエンスストア'] },
            { type: 'field', label: '延べ面積', value: '180㎡', anomalies: ['180.00㎡', '180.0㎡', '450㎡', '550㎡'] }, // 手数料計算では小数点なし
            { type: 'section-title', label: '手数料計算' },
            { type: 'field', label: '適用区分', value: '200㎡以下', anomalies: ['180㎡', '200㎡未満', '500㎡以下', '1000㎡以下'] },
            { type: 'field', label: '確認申請手数料', value: '18,000円', anomalies: ['18000円', '18,000円（税込）', '30,000円', '65,000円'] },
            { type: 'section-title', label: '設計者' },
            { type: 'field', label: '設計事務所', value: 'アトリエ建築設計 株式会社', anomalies: ['アトリエ建築(株)', 'アトリエ建築設計株式会社'] },
            { type: 'field', label: '代表者', value: '佐藤 健二', anomalies: ['佐藤健二', '一級建築士 佐藤健二'] }
        ]
    }
};

// 根拠法データベース（建築基準法の関連条文）
const lawArticles = [
    {
        title: '用途地域における用途制限',
        number: '建築基準法 第48条',
        content: '用途地域内の建築物の用途制限について定めています。第一種低層住居専用地域では、別表第2（い）項に掲げる建築物以外は建築できません。建築可能なのは、住宅、共同住宅、幼稚園、小中高等学校、図書館、診療所、老人ホーム等です。店舗は住宅兼用で床面積50㎡以下の非住居部分を持つものに限られます。',
        note: '本申請の専用住宅は、建築基準法別表第2（い）項第1号に該当し、第一種低層住居専用地域で建築可能な用途です。'
    },
    {
        title: '道路の定義',
        number: '建築基準法 第42条第1項',
        content: '道路とは、幅員4メートル以上のもので、次の各号のいずれかに該当する道を指します。\n\n第1号：道路法による道路\n第2号：都市計画法等による道路\n第3号：基準時に存在する道\n第4号：道路法等の事業計画のある道路で2年以内に事業が執行される予定のもの\n第5号：位置指定道路',
        note: '本申請では、道路法による道路（第42条第1項第1号）に接しており、幅員6.00m、接道長さ8.00mで建築基準法の接道義務を満たしています。'
    },
    {
        title: '接道義務',
        number: '建築基準法 第43条',
        content: '建築物の敷地は、道路に2メートル以上接しなければなりません。ただし、その敷地の周囲に広い空地を有する建築物その他で一定の基準に適合するものについては、特定行政庁の許可を受けることで例外が認められます。',
        note: '本申請の敷地は、幅員6.00mの道路に8.00m接しており、接道義務を満たしています。'
    },
    {
        title: '建ぺい率',
        number: '建築基準法 第53条',
        content: '建築物の建築面積の敷地面積に対する割合（建ぺい率）は、用途地域に応じて都市計画で定められた数値を超えてはなりません。第一種低層住居専用地域では、通常30%、40%、50%、60%のいずれかが指定されます。',
        note: '本申請では、建築面積100.00㎡、敷地面積200.00㎡で建ぺい率50.00%となり、制限値60%以下を満たしています。'
    },
    {
        title: '容積率',
        number: '建築基準法 第52条',
        content: '建築物の延べ面積の敷地面積に対する割合（容積率）は、用途地域と前面道路幅員に応じた制限値を超えてはなりません。前面道路幅員が12m未満の場合、その幅員に一定の係数を乗じた数値と、都市計画で定められた容積率のいずれか小さい方が適用されます。',
        note: '本申請では、延べ面積180.00㎡、敷地面積200.00㎡で容積率90.00%となり、制限値200%以下を満たしています。'
    },
    {
        title: '絶対高さ制限',
        number: '建築基準法 第55条',
        content: '第一種低層住居専用地域及び第二種低層住居専用地域内においては、建築物の高さは10メートル又は12メートルのうち当該地域に関する都市計画において定められた建築物の高さの限度を超えてはなりません。',
        note: '本申請の建築物は高さ9.50mであり、第一種低層住居専用地域の絶対高さ制限10m以下を満たしています。'
    },
    {
        title: '北側斜線制限',
        number: '建築基準法 第56条第1項第3号',
        content: '第一種低層住居専用地域又は第二種低層住居専用地域内においては、建築物の各部分の高さは、その部分から前面道路の反対側の境界線又は隣地境界線までの真北方向の水平距離に1.25を乗じて得たものに5メートルを加えたもの以下としなければなりません。',
        note: '本申請では、北側境界線から1.00m後退することで北側斜線制限に適合した設計としています。'
    },
    {
        title: '防火地域及び準防火地域内の建築物',
        number: '建築基準法 第61条（旧第61条・第62条を統合）',
        content: '防火地域及び準防火地域内の建築物は、規模に応じて耐火建築物、準耐火建築物等とする必要があります。準防火地域内の木造建築物等は、外壁及び軒裏で延焼のおそれのある部分を防火構造としなければなりません。500㎡以下の1・2階建ては外壁の延焼のおそれのある部分を防火構造とします。',
        note: '本申請の建築物は準防火地域内の木造2階建（延べ面積180㎡）であり、外壁及び軒裏の延焼のおそれのある部分を防火構造とする基準に適合させています。'
    },
    {
        title: '構造耐力',
        number: '建築基準法 第20条',
        content: '建築物は、自重、積載荷重、積雪荷重、風圧、土圧及び水圧並びに地震その他の震動及び衝撃に対して安全な構造としなければなりません。構造安全性の確認方法は「構造計算」と「仕様規定」に分かれます。木造2階建500㎡以下等の四号建築物は、仕様規定（壁量等の基準）で確認できます。壁量計算は仕様規定に含まれるもので、構造計算とは異なります。',
        note: '本申請では、木造在来軸組工法2階建として、仕様規定に基づく壁量計算等により構造安全性の確認を行っています。'
    }
];

// 各書類に異常を追加する関数
function initializeDocuments() {
    Object.keys(documents).forEach(key => {
        const doc = documents[key];

        // まず全てのフィールドをリセット
        doc.fields.forEach(field => {
            field.currentValue = field.value;
            field.hasAnomaly = false;
        });

        // 50%の確率で異常を含む
        if (Math.random() < 0.5) {
            doc.hasAnomaly = true;

            // 異常のある候補フィールドを選択
            const validFields = doc.fields.filter(f =>
                f.anomalies && f.anomalies.length > 0
            );

            if (validFields.length > 0) {
                // 1〜3個のランダムな不備を生成
                const anomalyCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
                const selectedFields = [];

                // ランダムに異常フィールドを選択（重複なし）
                for (let i = 0; i < Math.min(anomalyCount, validFields.length); i++) {
                    let randomField;
                    do {
                        randomField = validFields[Math.floor(Math.random() * validFields.length)];
                    } while (selectedFields.includes(randomField));

                    selectedFields.push(randomField);
                    const randomAnomaly = randomField.anomalies[Math.floor(Math.random() * randomField.anomalies.length)];

                    // 異常を設定
                    randomField.currentValue = randomAnomaly;
                    randomField.hasAnomaly = true;
                }
            }
        } else {
            doc.hasAnomaly = false;
        }
    });
}

// 画面切り替え
function switchScreen(fromId, toId) {
    const fromScreen = document.getElementById(fromId);
    const toScreen = document.getElementById(toId);

    if (fromScreen) {
        fromScreen.classList.remove('active');
        fromScreen.style.display = 'none';
    }
    if (toScreen) {
        toScreen.style.display = 'flex';
        toScreen.classList.add('active');
    }
}

// 書類を生成して表示
function generateDocument(windowNumber) {
    const doc = documents[windowNumber];
    const container = document.getElementById('document-content');

    container.innerHTML = `
        <div class="document-header">
            <div class="document-number">第${windowNumber}号様式</div>
            <h2>${doc.name}</h2>
            <p class="document-theme">【${doc.theme}】</p>
            <p class="document-hint">確認事項: ${doc.hint}</p>
        </div>
        <div class="document-body">
            ${doc.fields.map((field, index) => {
                if (field.type === 'header') {
                    return `
                        <div class="doc-row doc-header">
                            <span class="doc-field-label">${field.label}:</span>
                            <span class="doc-field-value doc-clickable" data-index="${index}">${field.currentValue || field.value}</span>
                        </div>
                    `;
                } else if (field.type === 'section-title') {
                    return `<div class="doc-section-title">${field.label}</div>`;
                } else {
                    return `
                        <div class="doc-row">
                            <span class="doc-field-label">${field.label}:</span>
                            <span class="doc-field-value doc-clickable" data-index="${index}">${field.currentValue || field.value}</span>
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;

    // 訂正印を復元
    gameState.corrections.forEach(index => {
        const element = container.querySelector(`[data-index="${index}"]`);
        if (element) {
            const rect = element.getBoundingClientRect();
            addCorrectionStamp(element, rect.width / 2, rect.height / 2, index);
        }
    });
}

// 訂正印を追加
function addCorrectionStamp(element, x, y, index) {
    const stamp = document.createElement('div');
    stamp.className = 'correction-stamp';
    stamp.textContent = '訂正';
    stamp.style.left = `${x}px`;
    stamp.style.top = `${y}px`;
    stamp.dataset.stampIndex = index;

    // クリックで削除
    stamp.addEventListener('click', (event) => {
        event.stopPropagation();
        removeCorrectionStamp(stamp, index);
    });

    element.style.position = 'relative';
    element.appendChild(stamp);
}

// 訂正印を削除
function removeCorrectionStamp(stamp, index) {
    const indexPos = gameState.corrections.indexOf(index);
    if (indexPos > -1) {
        gameState.corrections.splice(indexPos, 1);
    }
    stamp.remove();
}

// 書類のクリック処理
function handleDocumentClick(event) {
    const target = event.target;

    if (target.classList.contains('doc-clickable')) {
        const index = parseInt(target.dataset.index);

        if (index !== undefined && !isNaN(index)) {
            const rect = target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // すでに訂正済みかチェック
            if (!gameState.corrections.includes(index)) {
                gameState.corrections.push(index);
                addCorrectionStamp(target, x, y, index);
                playSound('stamp');
            }
        }
    }
}

// 書類提出の判定
function submitDocument() {
    const doc = documents[gameState.currentWindow];

    // 異常があるフィールドのインデックスを取得
    const anomalyIndices = [];
    doc.fields.forEach((field, index) => {
        if (field.hasAnomaly) {
            anomalyIndices.push(index);
        }
    });

    // 訂正したインデックスをソート
    const corrected = [...gameState.corrections].sort((a, b) => a - b);
    const expected = [...anomalyIndices].sort((a, b) => a - b);

    // 判定：訂正箇所が異変箇所と完全一致するか
    const isCorrect = JSON.stringify(corrected) === JSON.stringify(expected);

    if (isCorrect) {
        // 成功：書類を保存
        gameState.submittedDocuments.push({
            window: gameState.currentWindow,
            name: doc.name,
            hadAnomalies: anomalyIndices.length > 0
        });

        if (gameState.currentWindow === gameState.maxWindow) {
            // クリア
            showEnding();
        } else {
            showResult(true);
        }
    } else {
        // 失敗：1番窓口に戻る
        showResult(false);
    }
}

// 結果画面を表示
function showResult(success) {
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const continueBtn = document.getElementById('continue-button');
    const retryBtn = document.getElementById('retry-button');

    // 古いイベントリスナーを削除するため、ボタンをクローン
    const newContinueBtn = continueBtn.cloneNode(true);
    continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);

    if (success) {
        resultTitle.textContent = '受理されました';
        resultMessage.textContent = `${gameState.currentWindow}番窓口の審査を通過しました。\n次は${gameState.currentWindow + 1}番窓口へお進みください。`;
        newContinueBtn.style.display = 'block';
        retryBtn.style.display = 'none';

        newContinueBtn.addEventListener('click', () => {
            gameState.currentWindow++;
            gameState.corrections = [];
            switchScreen('result-screen', 'waiting-screen');
            setTimeout(() => showWaitingRoom(), 100);
        });
    } else {
        // 失敗時の効果
        playSound('buzzer');

        resultTitle.textContent = '不備があります';

        // 具体的なエラーメッセージ
        const doc = documents[gameState.currentWindow];
        const anomalyIndices = [];
        doc.fields.forEach((field, index) => {
            if (field.hasAnomaly) {
                anomalyIndices.push(index);
            }
        });
        const corrected = gameState.corrections;

        let errorDetail = '';
        let missedErrors = [];
        let wrongCorrections = [];

        // 見落としている不備を特定
        anomalyIndices.forEach(idx => {
            if (!corrected.includes(idx)) {
                const field = doc.fields[idx];
                missedErrors.push({
                    label: field.label,
                    correct: field.value,
                    wrong: field.currentValue
                });
            }
        });

        // 誤って訂正した箇所を特定
        corrected.forEach(idx => {
            if (!anomalyIndices.includes(idx)) {
                const field = doc.fields[idx];
                wrongCorrections.push({
                    label: field.label,
                    value: field.currentValue
                });
            }
        });

        if (missedErrors.length > 0 && wrongCorrections.length > 0) {
            errorDetail = '見落としている不備があり、正常な箇所にも訂正印を押しています。\n\n';
        } else if (missedErrors.length > 0) {
            errorDetail = '見落としている不備があります。\n\n';
        } else if (wrongCorrections.length > 0) {
            errorDetail = '正常な箇所に訂正印を押しています。\n\n';
        } else {
            errorDetail = '訂正箇所が間違っています。\n\n';
        }

        // 見落とした不備の詳細を表示
        if (missedErrors.length > 0) {
            errorDetail += '【見落とした不備】\n';
            missedErrors.forEach(err => {
                errorDetail += `・${err.label}\n`;
                errorDetail += `  誤: ${err.wrong}\n`;
                errorDetail += `  正: ${err.correct}\n`;
            });
            errorDetail += '\n';
        }

        // 誤って訂正した箇所を表示
        if (wrongCorrections.length > 0) {
            errorDetail += '【誤って訂正した箇所】\n';
            wrongCorrections.forEach(wrong => {
                errorDetail += `・${wrong.label}: ${wrong.value}（正常）\n`;
            });
            errorDetail += '\n';
        }

        resultMessage.textContent = `${errorDetail}1番窓口からやり直してください。`;
        newContinueBtn.style.display = 'block';
        retryBtn.style.display = 'none';

        gameState.loopCount++;

        newContinueBtn.addEventListener('click', () => {
            gameState.currentWindow = 1;
            gameState.corrections = [];
            gameState.submittedDocuments = []; // リセット
            // 書類を再初期化
            initializeDocuments();
            switchScreen('result-screen', 'waiting-screen');
            setTimeout(() => showWaitingRoom(), 100);
        });
    }

    switchScreen('document-screen', 'result-screen');
}

// エンディング表示
function showEnding() {
    document.getElementById('loop-count').textContent = gameState.loopCount;
    switchScreen('document-screen', 'ending-screen');
}

// 待合室表示
function showWaitingRoom() {
    const currentWindowDisplay = document.getElementById('current-window-display');
    const waitingMessage = document.getElementById('waiting-message');
    const approachBtn = document.getElementById('approach-button');

    currentWindowDisplay.textContent = gameState.currentWindow;
    waitingMessage.textContent = '窓口の順番をお待ちください...';
    approachBtn.style.display = 'none';

    // 2秒後に窓口へ進めるようにする
    setTimeout(() => {
        waitingMessage.textContent = 'お待たせいたしました。窓口へお進みください。';
        approachBtn.style.display = 'block';
    }, 2000);
}

// プレイヤー情報モーダル表示
function showPlayerInfo() {
    const modal = document.getElementById('info-modal');
    const content = document.getElementById('modal-info-content');

    content.innerHTML = `
        <h2>申請者・建築物情報</h2>
        <p class="info-note">書類作成時に参照できる正しい情報です</p>

        <div class="info-content-scroll">
            <div class="info-columns">
                <div class="info-column">
                    <div class="info-section">
                        <h3>建築主情報</h3>
                        <p><strong>氏名:</strong> ${gameState.playerInfo.ownerNameWithSpace}</p>
                        <p><strong>フリガナ:</strong> ${gameState.playerInfo.ownerKana}</p>
                        <p><strong>住所:</strong> ${gameState.playerInfo.ownerAddress}</p>
                        <p><strong>住所（略式）:</strong> ${gameState.playerInfo.ownerAddressSimple}</p>
                        <p><strong>電話番号:</strong> ${gameState.playerInfo.ownerPhone}</p>
                    </div>

                    <div class="info-section">
                        <h3>設計者情報</h3>
                        <p><strong>名称:</strong> ${gameState.playerInfo.designerName}</p>
                        <p><strong>略称:</strong> ${gameState.playerInfo.designerNameShort}</p>
                        <p><strong>代表者:</strong> ${gameState.playerInfo.designerRepresentativeWithSpace}</p>
                        <p><strong>資格:</strong> ${gameState.playerInfo.designerLicenseNumber}</p>
                        <p><strong>電話番号:</strong> ${gameState.playerInfo.designerPhone}</p>
                    </div>

                    <div class="info-section">
                        <h3>構造設計者情報</h3>
                        <p><strong>名称:</strong> ${gameState.playerInfo.structuralDesigner}</p>
                        <p><strong>略称:</strong> ${gameState.playerInfo.structuralDesignerShort}</p>
                        <p><strong>担当者:</strong> ${gameState.playerInfo.structuralEngineerWithSpace}</p>
                        <p><strong>資格:</strong> ${gameState.playerInfo.structuralLicense}</p>
                        <p><strong>電話番号:</strong> ${gameState.playerInfo.structuralPhone}</p>
                    </div>

                    <div class="info-section">
                        <h3>建築物の基本情報</h3>
                        <p><strong>建築場所:</strong> ${gameState.playerInfo.buildingLocation}</p>
                        <p><strong>建築場所（略式）:</strong> ${gameState.playerInfo.buildingLocationSimple}</p>
                        <p><strong>用途:</strong> ${gameState.playerInfo.buildingUse}</p>
                        <p><strong>用途（法別表）:</strong> ${gameState.playerInfo.buildingUseCode}</p>
                        <p><strong>構造:</strong> ${gameState.playerInfo.structureDetail}</p>
                        <p><strong>階数:</strong> ${gameState.playerInfo.floors}</p>
                    </div>

                    <div class="info-section">
                        <h3>地域地区</h3>
                        <p><strong>用途地域:</strong> ${gameState.playerInfo.useDistrict}</p>
                        <p><strong>防火地域:</strong> ${gameState.playerInfo.fireDistrict}</p>
                    </div>
                </div>

                <div class="info-column">
                    <div class="info-section">
                        <h3>道路情報</h3>
                        <p><strong>道路種別:</strong> ${gameState.playerInfo.roadType}</p>
                        <p><strong>道路幅員:</strong> ${gameState.playerInfo.roadWidthFormatted}</p>
                        <p><strong>接道長さ:</strong> ${gameState.playerInfo.frontageFormatted}</p>
                    </div>

                    <div class="info-section">
                        <h3>敷地・建築面積情報</h3>
                        <p><strong>敷地面積:</strong> ${gameState.playerInfo.siteAreaFormatted}</p>
                        <p><strong>建築面積:</strong> ${gameState.playerInfo.buildingAreaFormatted}</p>
                        <p><strong>建ぺい率:</strong> ${gameState.playerInfo.buildingCoverageRatio}%（制限${gameState.playerInfo.buildingCoverageRatioLimit}%）</p>
                        <p class="info-note-small">※計算: ${gameState.playerInfo.buildingArea}÷${gameState.playerInfo.siteArea}×100=${gameState.playerInfo.buildingCoverageRatio}%</p>
                    </div>

                    <div class="info-section">
                        <h3>延床面積・容積率情報</h3>
                        <p><strong>1階床面積:</strong> ${gameState.playerInfo.firstFloorArea}㎡</p>
                        <p><strong>2階床面積:</strong> ${gameState.playerInfo.secondFloorArea}㎡</p>
                        <p><strong>延べ面積:</strong> ${gameState.playerInfo.totalFloorAreaFormatted}</p>
                        <p class="info-note-small">※計算: ${gameState.playerInfo.firstFloorArea}+${gameState.playerInfo.secondFloorArea}=${gameState.playerInfo.totalFloorArea}㎡</p>
                        <p><strong>容積率:</strong> ${gameState.playerInfo.floorAreaRatio}%（制限${gameState.playerInfo.floorAreaRatioLimit}%）</p>
                        <p class="info-note-small">※計算: ${gameState.playerInfo.totalFloorArea}÷${gameState.playerInfo.siteArea}×100=${gameState.playerInfo.floorAreaRatio}%</p>
                    </div>

                    <div class="info-section">
                        <h3>高さ情報・法適合性</h3>
                        <p><strong>建築物の高さ:</strong> ${gameState.playerInfo.buildingHeightFormatted}</p>
                        <p><strong>軒の高さ:</strong> ${gameState.playerInfo.eaveHeightFormatted}</p>
                        <p><strong>絶対高さ制限:</strong> 10m以下（第一種低層）</p>
                        <p><strong>北側斜線:</strong> 適合（後退${gameState.playerInfo.northSideSetbackFormatted}）</p>
                    </div>

                    <div class="info-section">
                        <h3>日付情報</h3>
                        <p><strong>事前協議日:</strong> ${gameState.playerInfo.preConsultationDate}</p>
                        <p><strong>構造計算書作成日:</strong> ${gameState.playerInfo.structuralCalcDate}</p>
                        <p><strong>設計図書作成日:</strong> ${gameState.playerInfo.designDate}</p>
                        <p><strong>申請日:</strong> ${gameState.playerInfo.applicationDate}</p>
                    </div>

                    <div class="info-section">
                        <h3>手数料情報</h3>
                        <p><strong>延べ面積:</strong> ${gameState.playerInfo.totalFloorArea}㎡</p>
                        <p><strong>適用区分:</strong> ${gameState.playerInfo.feeCalculationBasis}</p>
                        <p><strong>申請手数料:</strong> ${gameState.playerInfo.applicationFeeFormatted}</p>
                    </div>
                </div>
            </div>

            <div class="info-rules">
                <h3>【重要】書類の記載ルール</h3>
                <ul>
                    <li><strong>氏名:</strong> 姓と名の間に半角スペース1つ（例: 青山 太一）</li>
                    <li><strong>住所:</strong> 正式表記は漢数字（一丁目2番3号）、略式はアラビア数字（1-2-3）</li>
                    <li><strong>会社名:</strong> 「株式会社」は略さず正式表記、「(株)」は略称</li>
                    <li><strong>面積:</strong> 小数点以下2桁（100.00㎡）、手数料計算書では整数表記</li>
                    <li><strong>建ぺい率・容積率:</strong> 「実際の値（制限値）」または「実際の値%（制限値%）」</li>
                    <li><strong>用途地域:</strong> 正式名称で記載（例: 第一種低層住居専用地域）</li>
                    <li><strong>道路種別:</strong> 建築基準法の条項を正確に（例: 第42条第1項第1号）</li>
                    <li><strong>電話番号:</strong> ハイフンで区切る（0XX-1234-5678）</li>
                    <li><strong>日付:</strong> 和暦、日は0埋めなし（令和6年9月1日）</li>
                    <li><strong>資格:</strong> 資格名と番号の間にスペース（一級建築士 第123456号）</li>
                    <li><strong>構造:</strong> 詳細を明記する場合あり（木造在来軸組工法2階建）</li>
                    <li><strong>法適合性:</strong> 北側斜線、絶対高さ制限などの適合状況を正確に</li>
                </ul>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// 提出済み書類モーダル表示
function showSubmittedDocuments() {
    const modal = document.getElementById('submitted-modal');
    const content = document.getElementById('modal-submitted-content');

    if (gameState.submittedDocuments.length === 0) {
        content.innerHTML = '<p class="no-documents">まだ提出した書類はありません</p>';
    } else {
        content.innerHTML = `
            <h3>提出済み書類一覧</h3>
            ${gameState.submittedDocuments.map(doc => `
                <div class="submitted-doc-item">
                    <strong>${doc.window}番窓口:</strong> ${doc.name}
                    ${doc.hadAnomalies ? '<span class="had-anomaly">（訂正あり）</span>' : '<span class="no-anomaly">（訂正なし）</span>'}
                </div>
            `).join('')}
        `;
    }

    modal.classList.add('active');
}

// 根拠法モーダル表示
function showLawArticles() {
    const modal = document.getElementById('law-modal');
    const content = document.getElementById('modal-law-content');

    content.innerHTML = lawArticles.map(article => `
        <div class="law-article">
            <h3>${article.title}</h3>
            <div class="law-article-number">${article.number}</div>
            <div class="law-article-text">${article.content}</div>
            <div class="law-article-note">【本申請における適用】${article.note}</div>
        </div>
    `).join('');

    modal.classList.add('active');
}

// 効果音再生（簡易版）
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'stamp') {
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'buzzer') {
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    } catch (e) {
        // Audio API未対応の場合はスキップ
        console.log('Audio playback not supported');
    }
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    // 書類を初期化
    initializeDocuments();

    // スタートボタン（タイトル→ストーリー）
    document.getElementById('start-button').addEventListener('click', () => {
        switchScreen('title-screen', 'story-screen');
        // ストーリーボタンを12秒後に表示
        setTimeout(() => {
            document.getElementById('story-continue-button').style.display = 'block';
        }, 12000);
    });

    // ストーリー続けるボタン（ストーリー→情報画面）
    document.getElementById('story-continue-button').addEventListener('click', () => {
        switchScreen('story-screen', 'info-screen');
    });

    // 情報画面続けるボタン（情報画面→待機画面）
    document.getElementById('info-continue-button').addEventListener('click', () => {
        switchScreen('info-screen', 'waiting-screen');
        showWaitingRoom();
    });

    // 窓口へ進むボタン
    document.getElementById('approach-button').addEventListener('click', () => {
        switchScreen('waiting-screen', 'document-screen');
        generateDocument(gameState.currentWindow);
    });

    // 書類クリック
    document.getElementById('document-content').addEventListener('click', handleDocumentClick);

    // 提出ボタン
    document.getElementById('submit-button').addEventListener('click', submitDocument);

    // 情報確認ボタン
    const showInfoBtn = document.getElementById('show-info-button');
    const showSubmittedBtn = document.getElementById('show-submitted-button');
    const showLawBtn = document.getElementById('show-law-button');
    const infoModal = document.getElementById('info-modal');
    const submittedModal = document.getElementById('submitted-modal');
    const lawModal = document.getElementById('law-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const closeSubmittedBtn = document.getElementById('close-submitted');
    const closeLawBtn = document.getElementById('close-law');

    showInfoBtn.addEventListener('click', () => {
        showPlayerInfo();
    });

    showSubmittedBtn.addEventListener('click', () => {
        showSubmittedDocuments();
    });

    showLawBtn.addEventListener('click', () => {
        showLawArticles();
    });

    closeModalBtn.addEventListener('click', () => {
        infoModal.classList.remove('active');
    });

    closeSubmittedBtn.addEventListener('click', () => {
        submittedModal.classList.remove('active');
    });

    closeLawBtn.addEventListener('click', () => {
        lawModal.classList.remove('active');
    });

    // モーダル外クリックで閉じる
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.classList.remove('active');
        }
    });

    submittedModal.addEventListener('click', (e) => {
        if (e.target === submittedModal) {
            submittedModal.classList.remove('active');
        }
    });

    lawModal.addEventListener('click', (e) => {
        if (e.target === lawModal) {
            lawModal.classList.remove('active');
        }
    });

    // タイトルに戻るボタン
    document.getElementById('restart-button').addEventListener('click', () => {
        gameState.currentWindow = 1;
        gameState.loopCount = 0;
        gameState.corrections = [];
        gameState.submittedDocuments = [];
        initializeDocuments();
        // ストーリーボタンを非表示にリセット
        document.getElementById('story-continue-button').style.display = 'none';
        switchScreen('ending-screen', 'title-screen');
    });
});
