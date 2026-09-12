package org.mysteryatlas.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import org.mysteryatlas.AtlasViewModel
import org.mysteryatlas.data.*

@Composable fun AtlasApp(vm:AtlasViewModel=viewModel(),forceError:Boolean=false){
 val catalog by vm.catalog.collectAsStateWithLifecycle();val user by vm.user.collectAsStateWithLifecycle();val screen by vm.screen.collectAsStateWithLifecycle();val error by vm.error.collectAsStateWithLifecycle();val active by vm.active.collectAsStateWithLifecycle();val category by vm.category.collectAsStateWithLifecycle()
 val lang=user.language;val holder=rememberSaveableStateHolder()
 val storageFailed by vm.storageError.collectAsStateWithLifecycle()
 LaunchedEffect(forceError){if(forceError)vm.load(true)}
 BackHandler(screen!="home"){vm.back()}
 Surface(Modifier.fillMaxSize(),color=Ink){Column(Modifier.fillMaxSize().safeDrawingPadding()){
  Row(Modifier.fillMaxWidth().heightIn(min=60.dp).padding(horizontal=12.dp),verticalAlignment=Alignment.CenterVertically){
   if(screen !in listOf("home","explore","saved","search"))IconButton(onClick=vm::back,modifier=Modifier.testTag("back").semantics{contentDescription=tr(lang,"뒤로","Back")}){Glyph("back")}
   Box(Modifier.weight(1f).padding(start=if(screen in listOf("home","explore","saved","search"))8.dp else 0.dp)){Brand()}
   TextButton(onClick=vm::language,modifier=Modifier.testTag("lang_toggle").semantics{contentDescription=tr(lang,"영어로 변경","Switch to Korean")}){Text(if(lang=="ko")"EN"else"한",color=Muted,fontSize=14.sp)}
  }
   HorizontalDivider(color=Line.copy(alpha=.5f))
   if(storageFailed)Column(Modifier.fillMaxWidth().padding(horizontal=20.dp,vertical=8.dp).testTag("storage_error")){
    Text(tr(lang,"저장 상태를 확인하지 못했어요. 다시 시도해 주세요.","Your saved state could not be confirmed. Please try again."),style=MaterialTheme.typography.bodyMedium)
    TextButton(onClick=vm::retryStorage,modifier=Modifier.testTag("storage_retry")){Text(tr(lang,"다시 시도","Try again"))}
   }
  Box(Modifier.weight(1f)){
   when{
    error->Column(Modifier.fillMaxWidth().padding(24.dp)){EmptyMessage(tr(lang,"기록을 불러오지 못했어요","Unable to load the archive"),tr(lang,"잠시 후 다시 시도해 주세요. 저장한 이야기는 유지됩니다.","Try again. Your saved stories are retained."),"error_state");Button(onClick={vm.load()},modifier=Modifier.testTag("retry")){Text(tr(lang,"다시 시도","Try again"))}}
    catalog==null||!user.ready->Box(Modifier.fillMaxSize(),contentAlignment=Alignment.Center){CircularProgressIndicator()}
    else->{val data=catalog!!;holder.SaveableStateProvider(when(screen){"article"->"article:$active";"category"->"category:$category";else->screen}){
     when(screen){
      "home"->Home(data,user,lang,vm)
      "explore"->Explore(data,lang,vm)
      "category"->CategoryScreen(data,category,lang,vm)
      "article"->ArticleScreen(data,active,user,lang,vm)
      "rabbit"->RabbitScreen(data,lang,vm)
      "search"->SearchScreen(lang,vm)
      "saved"->SavedScreen(data,user,lang,vm)
      "recent"->RecentScreen(data,user,lang,vm)
      else->Home(data,user,lang,vm)
     }
    }}
   }
  }
  HorizontalDivider(color=Line)
  NavigationBar(containerColor=Ink,tonalElevation=0.dp){listOf("home" to tr(lang,"홈","Home"),"explore" to tr(lang,"탐색","Explore"),"saved" to tr(lang,"저장","Saved"),"search" to tr(lang,"검색","Search")).forEach{(id,label)->NavigationBarItem(selected=screen==id,onClick={vm.tab(id)},icon={Glyph(id,if(screen==id)Amber else Muted)},label={Text(label,fontSize=14.sp)},colors=NavigationBarItemDefaults.colors(indicatorColor=Amber.copy(alpha=.09f),selectedTextColor=Amber,unselectedTextColor=Muted),modifier=Modifier.testTag("nav_$id"))}}
 }}
}

@OptIn(ExperimentalLayoutApi::class)
@Composable private fun Home(data:Catalog,user:UserState,lang:String,vm:AtlasViewModel){val hero=data.cases.first{it.id=="cooper"};LazyColumn(Modifier.fillMaxSize().testTag("home_list"),contentPadding=PaddingValues(bottom=24.dp)){
 item{Column{
  Box(Modifier.fillMaxWidth()){
   Art(hero.image,lang,Modifier.matchParentSize())
   Box(Modifier.matchParentSize().background(Brush.verticalGradient(listOf(Color.Transparent,Ink.copy(alpha=.25f),Ink))))
   Column(Modifier.fillMaxWidth().padding(horizontal=22.dp).padding(top=18.dp,bottom=12.dp)){
    FlowRow(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Pill(tr(lang,"오늘의 미스터리","TODAY'S MYSTERY"));Text(tr(lang,"재구성 이미지","ILLUSTRATION"),color=Muted,fontSize=14.sp,modifier=Modifier.background(Ink.copy(alpha=.6f)).padding(5.dp))}
    Spacer(Modifier.height(145.dp))
    StoryMeta(hero,lang)
    Text(hero.headline.text(lang),style=MaterialTheme.typography.headlineLarge,modifier=Modifier.padding(top=13.dp))
    Text(hero.hook.text(lang),style=MaterialTheme.typography.bodyLarge,color=Muted,modifier=Modifier.padding(top=9.dp))
   }
  }
  FlowRow(Modifier.fillMaxWidth().padding(horizontal=22.dp).padding(bottom=16.dp),horizontalArrangement=Arrangement.spacedBy(12.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
   Button(onClick={vm.open(hero.id)},shape=RoundedCornerShape(28.dp),modifier=Modifier.heightIn(min=50.dp).testTag("hero_open")){Text(tr(lang,"사건 읽기","Read story"),fontWeight=FontWeight.Bold);Spacer(Modifier.width(12.dp));Glyph("arrow",Ink,Modifier.size(19.dp))}
   SaveButton(hero,hero.id in user.bookmarks,lang){vm.bookmark(hero.id)};ReadMeta(hero,lang)
  }
 }}
 item{Column(Modifier.padding(horizontal=20.dp)){SectionTitle(tr(lang,"지금 가장 많이 읽는 미스터리","Most-read mysteries"),tr(lang,"집계 준비 중","Readership data coming soon"));Text(tr(lang,"편집부 선정","EDITOR'S PICKS"),color=Amber,style=MaterialTheme.typography.labelLarge,modifier=Modifier.padding(bottom=12.dp))}}
 item{LazyRow(contentPadding=PaddingValues(horizontal=20.dp),horizontalArrangement=Arrangement.spacedBy(12.dp)){items(data.cases.filter{it.id!="cooper"}.take(4),key={it.id}){s->StoryCard(s,lang,Modifier.width(230.dp)){vm.open(s.id)}}}}
 item{Column(Modifier.padding(horizontal=20.dp)){SectionTitle("RABBIT HOLE",tr(lang,"하나의 의문에서, 더 깊은 이야기로","One question opens another"));Surface(color=Panel,shape=RoundedCornerShape(14.dp),border=BorderStroke(1.dp,Amber.copy(alpha=.4f)),modifier=Modifier.fillMaxWidth().testTag("rabbit_open").clickable{vm.rabbit()}){Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){Text(tr(lang,"그들은 사라졌다. 흔적은 남았다.","They vanished. The clues remained."),style=MaterialTheme.typography.titleLarge);Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){listOf("cooper","mary-celeste","dyatlov").forEach{id->val s=data.cases.first{it.id==id};Surface(shape=RoundedCornerShape(8.dp),modifier=Modifier.weight(1f)){Art(s.image,lang,Modifier.fillMaxWidth().height(85.dp))}}};Row(verticalAlignment=Alignment.CenterVertically){Text(tr(lang,"연결된 이야기 따라가기","Follow the connections"),color=Amber,modifier=Modifier.weight(1f));Glyph("arrow",Amber)}}}}}
 item{Column(Modifier.padding(horizontal=20.dp)){SectionTitle(tr(lang,"카테고리","Categories"),tr(lang,"세상을 다르게 바라보는 8가지 문","Eight doors into the unexplained"))}}
 item{LazyRow(contentPadding=PaddingValues(horizontal=20.dp),horizontalArrangement=Arrangement.spacedBy(12.dp)){items(data.categories,key={it.id}){c->Surface(shape=RoundedCornerShape(12.dp),color=Panel,border=BorderStroke(1.dp,Line),modifier=Modifier.width(175.dp).clickable{vm.category(c.id)}){Column{Art(c.image,lang,Modifier.fillMaxWidth().height(110.dp));Text(c.name.text(lang),style=MaterialTheme.typography.titleMedium,modifier=Modifier.padding(14.dp))}}}}}
 item{Column(Modifier.padding(horizontal=20.dp)){SectionTitle(tr(lang,"새로 들어온 기록","New to the archive"));data.cases.takeLast(3).forEach{s->StoryRow(s,lang){vm.open(s.id)}}}}
}}

@Composable private fun Explore(data:Catalog,lang:String,vm:AtlasViewModel){val columns=if(LocalConfiguration.current.screenWidthDp<370||LocalDensity.current.fontScale>1.3f)1 else 2;LazyColumn(Modifier.fillMaxSize().testTag("explore_list"),contentPadding=PaddingValues(20.dp)){
 item{Text(tr(lang,"탐색","Explore"),style=MaterialTheme.typography.headlineLarge);Text(tr(lang,"당신의 호기심은 어디로 향하나요?","Where will your curiosity lead?"),color=Muted,style=MaterialTheme.typography.bodyLarge,modifier=Modifier.padding(top=8.dp,bottom=22.dp))}
 items(data.categories.chunked(columns)){row->Row(horizontalArrangement=Arrangement.spacedBy(12.dp),modifier=Modifier.padding(bottom=14.dp)){row.forEach{c->Surface(shape=RoundedCornerShape(12.dp),color=Panel,border=BorderStroke(1.dp,Line),modifier=Modifier.weight(1f).testTag("category_${c.id}").clickable{vm.category(c.id)}){Column{Art(c.image,lang,Modifier.fillMaxWidth().height(126.dp));Column(Modifier.padding(13.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Text(c.name.text(lang),style=MaterialTheme.typography.titleMedium);Text(c.hook.text(lang),style=MaterialTheme.typography.bodyMedium,color=Muted);val count=data.cases.count{c.id in it.categoryIds};Text(if(count>0)tr(lang,"${count}개의 기록 →","$count stories →")else tr(lang,"기록 준비 중","Coming soon"),color=Amber,style=MaterialTheme.typography.labelMedium)}}}}}}
}}
@Composable private fun CategoryScreen(data:Catalog,id:String,lang:String,vm:AtlasViewModel){val c=data.categories.firstOrNull{it.id==id}?:return;val list=data.cases.filter{id in it.categoryIds};LazyColumn(Modifier.fillMaxSize().testTag("category_list"),contentPadding=PaddingValues(20.dp)){
 item{Text(c.name.text(lang),style=MaterialTheme.typography.headlineLarge);Text(c.hook.text(lang),color=Muted,modifier=Modifier.padding(vertical=10.dp))}
 if(list.isEmpty())item{EmptyMessage(tr(lang,"새로운 기록을 준비하고 있어요","New records are on their way"),tr(lang,"다른 카테고리에서 다음 이야기를 발견해 보세요.","Find your next story in another category."),"category_empty");TextButton(onClick={vm.tab("explore")}){Text(tr(lang,"다른 카테고리 탐색","Explore categories"))}}
 items(list,key={it.id}){s->StoryRow(s,lang){vm.open(s.id)}}
}}

@Composable private fun ArticleScreen(data:Catalog,id:String,user:UserState,lang:String,vm:AtlasViewModel){val story=data.cases.firstOrNull{it.id==id}?:return;val article by vm.article.collectAsStateWithLifecycle();val failed by vm.articleError.collectAsStateWithLifecycle();val pos=user.positions[id]?: (0 to 0);val state=rememberLazyListState(pos.first,pos.second)
 if(failed){Column(Modifier.padding(24.dp)){EmptyMessage(tr(lang,"이 기록을 열 수 없어요","This record could not be opened"),tr(lang,"다시 시도하거나 다른 이야기를 읽어 보세요.","Try again or explore another story."),"article_error");Button(onClick={vm.loadArticle(id)}){Text(tr(lang,"다시 시도","Try again"))}};return}
 val a=article?.takeIf{it.caseId==id};if(a==null){Box(Modifier.fillMaxSize(),contentAlignment=Alignment.Center){CircularProgressIndicator()};return}
 // Start observing only after content has loaded, so the empty loading layout cannot overwrite the saved position.
 LaunchedEffect(id,state,a){snapshotFlow{
  if(state.isScrollInProgress||state.layoutInfo.totalItemsCount==0)null
  else Triple(state.firstVisibleItemIndex,state.firstVisibleItemScrollOffset,state.firstVisibleItemIndex>3+a.sections.size||state.layoutInfo.visibleItemsInfo.any{it.key=="reading_end"&&it.offset+it.size<=state.layoutInfo.viewportEndOffset})
 }.filterNotNull().distinctUntilChanged().collect{vm.position(id,it.first,it.second);if(it.third)vm.complete(id)}}
 LazyColumn(state=state,modifier=Modifier.fillMaxSize().testTag("article_list"),contentPadding=PaddingValues(bottom=28.dp)){
  item{Box{Art(story.image,lang,Modifier.fillMaxWidth().height(240.dp),sharedImageNote(story,lang));Box(Modifier.fillMaxWidth().height(240.dp).background(Brush.verticalGradient(listOf(Color.Transparent,Ink.copy(alpha=.1f),Ink))));Text(sharedImageNote(story,lang)?:tr(lang,"재구성 이미지 · 실제 기록 사진이 아닙니다","Editorial illustration · not archival evidence"),style=MaterialTheme.typography.labelSmall,color=Muted,modifier=Modifier.align(Alignment.BottomStart).padding(horizontal=20.dp,vertical=9.dp))}}
  item{Column(Modifier.padding(horizontal=22.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){
   StoryMeta(story,lang)
   Text(story.headline.text(lang),style=MaterialTheme.typography.headlineLarge,modifier=Modifier.testTag("article_title"));Text(story.canonicalTitle,color=Amber,style=MaterialTheme.typography.labelLarge);Text(story.hook.text(lang),color=Muted,style=MaterialTheme.typography.bodyLarge)
   Row(verticalAlignment=Alignment.CenterVertically){ReadMeta(story,lang);Spacer(Modifier.weight(1f));SaveButton(story,story.id in user.bookmarks,lang){vm.bookmark(story.id)}};HorizontalDivider(color=Line)
  }}
  item{Surface(color=Panel,shape=RoundedCornerShape(12.dp),border=BorderStroke(1.dp,Amber.copy(alpha=.3f)),modifier=Modifier.padding(20.dp).testTag("article_summary")){Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){Text(tr(lang,"30초 요약","THE 30-SECOND BRIEF"),color=Amber,style=MaterialTheme.typography.titleMedium);Text(a.summary.text(lang),style=MaterialTheme.typography.bodyLarge)}}}
  items(a.sections,key={it.id}){s->Column(Modifier.fillMaxWidth().padding(horizontal=22.dp).padding(top=15.dp,bottom=17.dp).testTag("section_${s.id}"),verticalArrangement=Arrangement.spacedBy(15.dp)){
   Text(s.title.text(lang),style=MaterialTheme.typography.titleLarge,color=if(s.type=="timeline")Amber else Ivory)
   if(s.image!=null){Surface(shape=RoundedCornerShape(10.dp)){Art(s.image,lang,Modifier.fillMaxWidth().height(190.dp),sharedImageNote(story,lang))};Text(sharedImageNote(story,lang)?:tr(lang,"사건의 분위기를 표현한 재구성 이미지","An editorial reconstruction of the setting"),color=Muted,style=MaterialTheme.typography.labelSmall)}
   if(s.type in listOf("fact","quote","theories"))Surface(color=Panel,shape=RoundedCornerShape(10.dp),border=BorderStroke(1.dp,Line)){Text(s.body.text(lang),style=MaterialTheme.typography.bodyLarge,modifier=Modifier.padding(17.dp))}else Text(s.body.text(lang),style=MaterialTheme.typography.bodyLarge)
  }}
  item(key="reading_end"){Text(tr(lang,"본문 끝 · 아래에서 근거와 출처를 확인하세요","End of story · explore the evidence and sources below"),color=Muted,style=MaterialTheme.typography.labelMedium,modifier=Modifier.fillMaxWidth().padding(22.dp).testTag("article_read_end"))}
  item{Column(Modifier.padding(horizontal=22.dp).padding(top=20.dp,bottom=14.dp).testTag("evidence_section"),verticalArrangement=Arrangement.spacedBy(12.dp)){Text("EVIDENCE LAYER",color=Amber,style=MaterialTheme.typography.labelLarge);Text(tr(lang,"사실과 주장을 구분하다","Separate facts from claims"),style=MaterialTheme.typography.headlineMedium);Text(tr(lang,"확인됨 · 논쟁 중 · 주장 · 전승 · 반박됨","Confirmed · Disputed · Claim · Legend · Debunked"),color=Muted,style=MaterialTheme.typography.bodyMedium)}}
  items(a.evidence,key={"ev_${it.id}"}){e->val color=when(e.status){Epistemic.CONFIRMED->Color(0xFF96CAA8);Epistemic.DISPUTED->Amber;Epistemic.CLAIM->Color(0xFFE0A27F);Epistemic.LEGEND->Color(0xFFC6A6DE);Epistemic.DEBUNKED->Muted};Surface(color=Panel,shape=RoundedCornerShape(10.dp),border=BorderStroke(1.dp,Line),modifier=Modifier.padding(horizontal=20.dp,vertical=6.dp).testTag("evidence_${e.id}")){Column(Modifier.padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){Pill(evidenceLabel(e.status,lang),color);Text(e.text.text(lang),style=MaterialTheme.typography.bodyLarge);Text(e.sourceIds.mapNotNull{key->a.sources.firstOrNull{it.id==key}?.publisher}.distinct().joinToString(" · "),color=Muted,style=MaterialTheme.typography.labelSmall)}}}
  item{Column(Modifier.padding(22.dp).testTag("article_sources"),verticalArrangement=Arrangement.spacedBy(12.dp)){HorizontalDivider(color=Line);Text(tr(lang,"출처와 검증","Sources & verification"),style=MaterialTheme.typography.titleLarge);Text(tr(lang,"마지막 검증 · ${a.verifiedAt}","Last verified · ${a.verifiedAt}"),color=Muted,style=MaterialTheme.typography.bodyMedium)}}
  items(a.sources,key={"src_${it.id}"}){s->val uri=LocalUriHandler.current;var error by remember{mutableStateOf(false)};Column(Modifier.padding(horizontal=20.dp,vertical=4.dp)){OutlinedButton(onClick={runCatching{uri.openUri(s.url)}.onFailure{error=true}},shape=RoundedCornerShape(9.dp),modifier=Modifier.fillMaxWidth().testTag("source_${s.id}")){Column(Modifier.weight(1f).padding(vertical=7.dp)){Text(s.title,modifier=Modifier.fillMaxWidth(),color=Ivory,style=MaterialTheme.typography.bodyMedium);Text(s.publisher,color=Amber,style=MaterialTheme.typography.labelSmall)};Glyph("arrow",Amber,Modifier.size(18.dp))};if(error)Text(s.url,color=Muted,style=MaterialTheme.typography.bodyMedium)}}
  item{Column(Modifier.padding(22.dp),verticalArrangement=Arrangement.spacedBy(13.dp)){Text(tr(lang,"이미지 안내","About the imagery"),style=MaterialTheme.typography.titleMedium);Text(tr(lang,"이미지는 Mystery Atlas가 생성한 편집용 재구성입니다. 실제 사건 사진이나 증거 자료가 아닙니다.","Images are AI-generated editorial reconstructions by Mystery Atlas. They are not archival photographs or evidence."),color=Muted,style=MaterialTheme.typography.bodyMedium);SectionTitle("RABBIT HOLE",tr(lang,"이 의문은 어디로 이어질까?","Where does this question lead?"));Button(onClick=vm::rabbit,shape=RoundedCornerShape(10.dp),modifier=Modifier.fillMaxWidth().heightIn(min=52.dp).testTag("rabbit_open")){Text(tr(lang,"연결된 이야기 따라가기","Follow connected stories"));Spacer(Modifier.width(10.dp));Glyph("arrow",Ink)}}}
  items(story.related,key={"related_${it.caseId}"}){r->val next=data.cases.first{it.id==r.caseId};Column(Modifier.padding(horizontal=22.dp)){Text(r.reason.text(lang),color=Amber,style=MaterialTheme.typography.bodyMedium);StoryRow(next,lang,"related_${next.id}"){vm.open(next.id,true)}}}
 }
}
private fun evidenceLabel(status:Epistemic,lang:String)=when(status){Epistemic.CONFIRMED->tr(lang,"확인됨","Confirmed");Epistemic.DISPUTED->tr(lang,"논쟁 중","Disputed");Epistemic.CLAIM->tr(lang,"주장","Claim");Epistemic.LEGEND->tr(lang,"전승","Legend");Epistemic.DEBUNKED->tr(lang,"반박됨","Debunked")}

@Composable private fun RabbitScreen(data:Catalog,lang:String,vm:AtlasViewModel){val path by vm.path.collectAsStateWithLifecycle();val user by vm.user.collectAsStateWithLifecycle();val current=data.cases.firstOrNull{it.id==path.lastOrNull()}?:data.cases.first();LazyColumn(Modifier.fillMaxSize().testTag("rabbit_list"),contentPadding=PaddingValues(22.dp)){
 item{Text("RABBIT HOLE",color=Amber,style=MaterialTheme.typography.headlineMedium);Text(tr(lang,"하나의 의문, 다음 이야기","One question. Another story."),style=MaterialTheme.typography.bodyLarge,color=Muted,modifier=Modifier.padding(vertical=10.dp));Text("RABBIT HOLE · ${path.size.coerceAtLeast(1)}",color=Amber,style=MaterialTheme.typography.labelMedium,modifier=Modifier.testTag("rabbit_depth").padding(vertical=8.dp))}
 item{Surface(color=Panel,shape=RoundedCornerShape(12.dp),border=BorderStroke(1.dp,Line)){Column(Modifier.padding(14.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Text(tr(lang,"현재 연결 지점","CURRENT CONNECTION"),color=Muted,style=MaterialTheme.typography.labelSmall);Text(current.canonicalTitle,style=MaterialTheme.typography.titleLarge);Pill(current.status.text(lang))}}}
 item{Column(Modifier.testTag("rabbit_path")){path.forEachIndexed{index,id->val visited=data.cases.firstOrNull{it.id==id};if(visited!=null)TextButton(onClick={vm.revisit(id)},modifier=Modifier.fillMaxWidth().testTag("path_$id")){Text("${index+1}. ${visited.canonicalTitle}",modifier=Modifier.fillMaxWidth())}};SectionTitle(tr(lang,"다음 의문을 선택하세요","Choose your next question"),tr(lang,"공통 주제로 연결한 이야기입니다. 인과관계를 뜻하지 않습니다.","Connected by theme, not by a claim of causation."))}}
 if(current.related.all{it.caseId in path||it.caseId in user.recent})item{Column(Modifier.testTag("rabbit_exhausted")){EmptyMessage(tr(lang,"이 갈래의 이야기를 모두 방문했어요","You have visited every story on this branch"),tr(lang,"앞선 이야기로 돌아가거나 다른 카테고리에서 새 의문을 찾아보세요.","Revisit a story or explore another category."),"rabbit_exhausted_message");Button(onClick={vm.tab("explore")},modifier=Modifier.testTag("rabbit_explore")){Text(tr(lang,"다른 이야기 탐색","Explore other stories"))}}}
 items(current.related,key={it.caseId}){r->val s=data.cases.first{it.id==r.caseId};Column(Modifier.padding(bottom=14.dp)){if(s.id in path)Pill(tr(lang,"현재 경로에서 방문함","Visited on this path"))else readingLabel(user,s.id,lang)?.let{Pill(it)};Text(r.reason.text(lang),color=Amber,style=MaterialTheme.typography.bodyMedium,modifier=Modifier.padding(bottom=9.dp));StoryCard(s,lang,Modifier.fillMaxWidth(),"related_${s.id}"){vm.open(s.id,true)}}}
}}
@Composable private fun SearchScreen(lang:String,vm:AtlasViewModel){val query by vm.query.collectAsStateWithLifecycle();val list=vm.results();val keyboard=LocalSoftwareKeyboardController.current;Column(Modifier.fillMaxSize().padding(horizontal=20.dp)){
 Text(tr(lang,"검색","Search"),style=MaterialTheme.typography.headlineLarge,modifier=Modifier.padding(top=22.dp,bottom=18.dp))
 OutlinedTextField(value=query,onValueChange=vm::query,keyboardOptions=KeyboardOptions(imeAction=ImeAction.Search),keyboardActions=KeyboardActions(onSearch={keyboard?.hide()}),placeholder={Text(tr(lang,"사건, 인물, 장소를 찾아보세요","Search stories, people, places"),fontSize=15.sp)},singleLine=true,leadingIcon={Glyph("search",Muted)},shape=RoundedCornerShape(12.dp),modifier=Modifier.fillMaxWidth().testTag("search_input"))
 if(query.isBlank())Text(tr(lang,"이런 이야기는 어떠세요?","START WITH A QUESTION"),color=Amber,style=MaterialTheme.typography.labelLarge,modifier=Modifier.padding(top=22.dp,bottom=8.dp))else Text(tr(lang,"${list.size}개의 기록","${list.size} records"),color=Muted,modifier=Modifier.padding(top=18.dp))
 LazyColumn(Modifier.fillMaxSize().testTag("search_results"),contentPadding=PaddingValues(bottom=24.dp)){if(list.isEmpty())item{EmptyMessage(tr(lang,"아직 발견하지 못한 이야기예요","No stories found"),tr(lang,"다른 사건명이나 영문 이름으로 검색해 보세요.","Try another name or keyword."),"search_empty")};items(list,key={it.id}){s->StoryRow(s,lang,"search_result_${s.id}"){vm.open(s.id)}}}
}}
@OptIn(ExperimentalLayoutApi::class)
@Composable private fun SavedScreen(data:Catalog,user:UserState,lang:String,vm:AtlasViewModel){val list=data.cases.filter{it.id in user.bookmarks};LazyColumn(Modifier.fillMaxSize().testTag("saved_list"),contentPadding=PaddingValues(20.dp)){
 item{Text(tr(lang,"저장한 이야기","Saved stories"),style=MaterialTheme.typography.headlineLarge);FlowRow(Modifier.fillMaxWidth().padding(vertical=14.dp),horizontalArrangement=Arrangement.spacedBy(10.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Pill(tr(lang,"전체 ${list.size}","All ${list.size}"));TextButton(onClick=vm::recent,modifier=Modifier.testTag("recent_open")){Glyph("clock",Amber,Modifier.size(17.dp));Spacer(Modifier.width(7.dp));Text(tr(lang,"최근 읽은 이야기","Recently read"))}}}
 if(list.isEmpty())item{EmptyMessage(tr(lang,"다시 보고 싶은 의문을 모아두세요","Keep a question for later"),tr(lang,"기사의 저장 버튼을 누르면 여기에서 다시 이어 읽을 수 있어요.","Save a story to return to it here."),"saved_empty");Button(onClick={vm.tab("home")}){Text(tr(lang,"이야기 발견하기","Discover stories"))}}
 items(list,key={it.id}){s->Row(verticalAlignment=Alignment.CenterVertically){Box(Modifier.weight(1f)){StoryRow(s,lang,readingState=readingLabel(user,s.id,lang)){vm.open(s.id)}};SaveButton(s,true,lang){vm.bookmark(s.id)}}}
}}
@Composable private fun RecentScreen(data:Catalog,user:UserState,lang:String,vm:AtlasViewModel){val list=user.recent.mapNotNull{id->data.cases.firstOrNull{it.id==id}};LazyColumn(Modifier.fillMaxSize().testTag("recent_list"),contentPadding=PaddingValues(20.dp)){
 item{Text(tr(lang,"최근 읽은 이야기","Recently read"),style=MaterialTheme.typography.headlineLarge);Text(tr(lang,"남겨둔 의문에서 다시 시작하세요.","Pick up the questions you left behind."),color=Muted,style=MaterialTheme.typography.bodyLarge,modifier=Modifier.padding(vertical=12.dp))}
 if(list.isEmpty())item{EmptyMessage(tr(lang,"첫 이야기를 기다리고 있어요","Your first story awaits"),tr(lang,"읽은 기록은 이 기기에만 저장됩니다.","Your reading history stays on this device."),"recent_empty")}
 items(list,key={it.id}){s->StoryRow(s,lang,readingState=readingLabel(user,s.id,lang)){vm.open(s.id)}}
}}
private fun readingLabel(user:UserState,id:String,lang:String):String?=when{id in user.completed->tr(lang,"읽음 · 본문 끝까지 이동함","Read · reached the end of the story");id in user.recent->tr(lang,"읽는 중","Reading");else->null}
