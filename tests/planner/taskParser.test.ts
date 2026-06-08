import { describe, it, expect } from 'vitest';
import { parseTaskRequirements, calcAvailableDays } from '../../src/planner/taskParser';

describe('parseTaskRequirements', () => {
  const sampleNotice = `关于举办郑州大学第一届"四创"大赛E2赛道"技能插件开发赛"的通知

各位同学：

为激发大学生创新创业活力，培养实践动手能力，郑州大学决定举办第一届"四创"大赛。现将E2赛道"技能插件开发赛"有关事项通知如下：

一、比赛主题
开发具有实际功能的 OpenClaw 技能插件，解决日常学习、科研、项目管理中的实际问题。

二、参赛要求
1. 团队人数不超过5人
2. 需开发具有实际功能的技能插件
3. 插件需能够正常加载和运行
4. 需按时提交电子版材料

三、交付物清单
参赛团队需提交以下材料：
- OpenClaw 插件代码（含完整项目源码）
- openclaw.plugin.json 插件配置文件
- README.md 项目说明文档
- 项目申报表（电子版）
- 答辩 PPT
- 演示视频（1-2分钟）

四、时间安排
- 报名截止：2026年5月20日
- 作品提交截止：2026年6月22日 12:00
- 答辩时间：2026年6月28日

五、提交方式
- 电子版材料发送至：zzu_e2_contest@zzu.edu.cn
- 邮件主题格式：[E2赛道]团队名称-插件名称
- 所有材料打包为一个 ZIP 文件，命名格式：团队名称_插件名称.zip

六、评审标准
- 创新性（30%）
- 实用性（30%）
- 技术实现（20%）
- 文档完整性（10%）
- 演示效果（10%）

七、注意事项
1. 每人限报1个赛道
2. 作品须为原创，不得抄袭
3. 往届获奖作品不得重复参赛
4. 逾期提交不予受理

请各参赛团队认真准备，按时提交作品。`;

  it('should extract task name from "关于...的通知" pattern', () => {
    const result = parseTaskRequirements(sampleNotice);
    expect(result.task_name).toContain('四创');
    expect(result.task_name).toContain('技能插件开发赛');
  });

  it('should extract deadline', () => {
    const result = parseTaskRequirements(sampleNotice);
    expect(result.deadline).toBe('2026-06-22T12:00:00');
  });

  it('should extract all 6 deliverables from bullet list', () => {
    const result = parseTaskRequirements(sampleNotice);
    expect(result.deliverables).toHaveLength(6);
    expect(result.deliverables).toEqual(
      expect.arrayContaining([
        'OpenClaw 插件代码',
        'openclaw.plugin.json 插件配置文件',
        'README.md 项目说明文档',
        '项目申报表',
        '答辩 PPT',
        '演示视频',
      ])
    );
  });

  it('should extract constraints', () => {
    const result = parseTaskRequirements(sampleNotice);
    expect(result.constraints.length).toBeGreaterThan(0);
    expect(result.constraints.some((c) => c.includes('不超过5人'))).toBe(true);
  });

  it('should extract submission rules', () => {
    const result = parseTaskRequirements(sampleNotice);
    expect(result.submission_rules.length).toBeGreaterThan(0);
    expect(result.submission_rules.some((r) => r.includes('zzu_e2_contest@zzu.edu.cn'))).toBe(true);
  });

  it('should preserve raw input', () => {
    const result = parseTaskRequirements(sampleNotice);
    expect(result.raw_input).toBe(sampleNotice);
  });

  it('should handle simple text with "将XX发送至" pattern', () => {
    const text = '请将项目报告发送至 example@test.com';
    const result = parseTaskRequirements(text);
    expect(result.deliverables).toContain('项目报告');
  });

  it('should handle empty or minimal input gracefully', () => {
    const result = parseTaskRequirements('一些随机文本，没有具体信息');
    expect(result.task_name).toBeTruthy();
    expect(result.raw_input).toBe('一些随机文本，没有具体信息');
  });

  it('should handle ISO date format', () => {
    const text = '截止日期：2026-06-22 12:00，请提交报告';
    const result = parseTaskRequirements(text);
    expect(result.deadline).toContain('2026-06-22');
  });

  it('should handle Chinese date format without year', () => {
    const text = '请在6月22日前提交申请表';
    const result = parseTaskRequirements(text);
    expect(result.deadline).toContain('06-22');
  });
});

describe('calcAvailableDays', () => {
  it('should return 30 for "未设置截止时间"', () => {
    expect(calcAvailableDays('未设置截止时间')).toBe(30);
  });

  it('should return positive number for future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const iso = futureDate.toISOString().slice(0, 10) + 'T23:59:00';
    expect(calcAvailableDays(iso)).toBeGreaterThanOrEqual(10);
  });

  it('should return at least 1 for past dates', () => {
    expect(calcAvailableDays('2020-01-01T00:00:00')).toBe(1);
  });
});
