import * as mc from "@minecraft/server";
import * as lantern from "project-lantern";
import * as hyData from "../data/data.js";

/**
 * 注册书籍
 */
export function bookRegister() { 
  const LETTER_0 = new lantern.SimpleReading(`hy:letter_0`, hyData.HyLetterTitle[0],hyData.HyLetterBody[0],);
  const LETTER_1 = new lantern.SimpleReading(`hy:letter_1`, hyData.HyLetterTitle[1],hyData.HyLetterBody[1],);
  const LETTER_2 = new lantern.SimpleReading(`hy:letter_2`, hyData.HyLetterTitle[2],hyData.HyLetterBody[2],);
  const LETTER_3 = new lantern.SimpleReading(`hy:letter_3`, hyData.HyLetterTitle[3],hyData.HyLetterBody[3],);
  const LETTER_4 = new lantern.SimpleReading(`hy:letter_4`, hyData.HyLetterTitle[4],hyData.HyLetterBody[4],);
  const LETTER_5 = new lantern.SimpleReading(`hy:letter_5`, hyData.HyLetterTitle[5],hyData.HyLetterBody[5],);
  const LETTER_6 = new lantern.SimpleReading(`hy:letter_6`, hyData.HyLetterTitle[6],hyData.HyLetterBody[6],);
  const LETTER_7 = new lantern.SimpleReading(`hy:letter_7`, hyData.HyLetterTitle[7],hyData.HyLetterBody[7],);
  const LETTER_8 = new lantern.SimpleReading(`hy:letter_8`, hyData.HyLetterTitle[8],hyData.HyLetterBody[8],);
  const LETTER_9 = new lantern.SimpleReading(`hy:letter_9`, hyData.HyLetterTitle[9],hyData.HyLetterBody[9],);
  const LETTER_10 = new lantern.SimpleReading(`hy:letter_10`, hyData.HyLetterTitle[10],hyData.HyLetterBody[10],);  
  const LETTER_11 = new lantern.SimpleReading(`hy:letter_11`, hyData.HyLetterTitle[11],hyData.HyLetterBody[11],);  
  const CHAPTER_1 = new lantern.SimpleReading(
    "hy:chapter_1",
    { translate: "hy.story.hs.title1" },
    hyData.HyStoryBody.section0,
    true,
  );
  const CHAPTER_2 = new lantern.SimpleReading(
    "hy:chapter_2",
    { translate: "hy.story.hs.title2" },
    hyData.HyStoryBody.section1,
    true,
  );
  const CHAPTER_3 = new lantern.SimpleReading(
    "hy:chapter_3",
    { translate: "hy.story.hs.title3" },
    hyData.HyStoryBody.section2,
    true,
  );
  const HIDDEN_STORIES = new lantern.ChapterReading(
    "hy:story_book",
    { translate: "hy.item.story_book" },
    { translate: "hy.story.hs.body" },
    [CHAPTER_1, CHAPTER_2, CHAPTER_3],
  );
}