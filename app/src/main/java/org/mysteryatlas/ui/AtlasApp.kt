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
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import org.mysteryatlas.AtlasViewModel
import org.mysteryatlas.data.*
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlin.math.max

@Composable fun AtlasApp(vm:AtlasViewModel=viewModel(),forceError:Boolean=false){
 val catalog by vm.catalog.collectAsStateWithLifecycle();val user by vm.user.collectAsStateWithLifecycle();val screen by vm.screen.collectAsStateWithLifecycle();val error by vm.error.collectAsStateWithLifecycle();val active by vm.active.collectAsStateWithLifecycle();val category by vm.category.collectAsStateWithLifecycle()
 val lang=user.language;val holder=rememberSaveableStateHolder()
 val storageFailed by vm.storageError.collectAsStateWithLifecycle()
 LaunchedEffect(forceError){if(forceError)vm.load(true)}
 BackHandler(screen!="home"){vm.back()}
 Surface(Modifier.fillMaxSize(),color=Ink){Column(Modifier.fillMaxSize().safeDrawingPadding()){
  Row(Modifier.fillMaxWidth().heightIn(min=60.dp).padding(horizontal=12.dp),verticalAlignment=Alignment.CenterVertically){
   if(screen !in listOf("home","explore","collections","saved","search"))IconButton(onClick=vm::back,modifier=Modifier.testTag("back").semantics{contentDescription=tr(lang,"뒤로","Back")}){Glyph("back")}
   Box(Modifier.weight(1f).padding(start=if(screen in listOf("home","explore","collections","saved","search"))8.dp else 0.dp)){Brand()}
   TextButton(onClick=vm::language,modifier=Modifier.testTag("lang_toggle").semantics{contentDescription=tr(lang,"영어로 보기","Switch to English")}){Text(if(lang=="ko")"EN"else"KO",color=Muted,fontSize=14.sp)}
  }
  HorizontalDivider(color=Line.copy(alpha=.5f))
  if(storageFailed)Column(Modifier.fillMaxWidth().padding(horizontal=20.dp,vertical=8.dp).testTag("storage_error")){
   Text(tr(lang,"저장 상태를 확인할 수 없습니다. 다시 열어보세요.","Your saved state could not be confirmed. Please try again."),style=MaterialTheme.typography.bodyMedium)
   TextButton(onClick=vm::retryStorage,modifier=Modifier.testTag("storage_retry")){Text(tr(lang,"다시 시도","Try again"))}
  }
  Box(Modifier.weight(1f)){
   when{
    error->Column(Modifier.fillMaxWidth().padding(24.dp)){EmptyMessage(tr(lang,"아카이브를 불러올 수 없습니다","Unable to load the archive"),tr(lang,"앱을 다시 실행해 주세요. 저장된 기록은 유지됩니다.","Please try again. Your saved stories are retained."),"error_state");Button(onClick={vm.load()},modifier=Modifier.testTag("retry")){Text(tr(lang,"다시 시도","Try again"))}}
    catalog==null||!user.ready->Box(Modifier.fillMaxSize(),contentAlignment=Alignment.Center){CircularProgressIndicator()}
    else->{val data=catalog!!;holder.SaveableStateProvider(when(screen){"article"->"article:$active";"preview"->"preview:$active";"category"->"category:$category";else->screen}){
     when(screen){
      "home"->Home(data,user,lang,vm)
      "explore"->Explore(data,lang,vm)
      "collections"->CollectionsScreen(data,lang,vm)
      "category"->CategoryScreen(data,category,lang,vm)
      "article"->ArticleScreen(data,active,user,lang,vm)
      "preview"->QuickPreviewScreen(data,active,lang,vm)
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
  NavigationBar(containerColor=Ink,tonalElevation=0.dp){listOf("home" to tr(lang,"홈","Home"),"explore" to tr(lang,"탐색","Explore"),"collections" to tr(lang,"컬렉션","Collections"),"saved" to tr(lang,"저장","Saved"),"search" to tr(lang,"검색","Search")).forEach{(id,label)->NavigationBarItem(selected=screen==id,onClick={vm.tab(id)},icon={Glyph(id,if(screen==id)Amber else Muted)},label={Text(label,fontSize=14.sp)},colors=NavigationBarItemDefaults.colors(indicatorColor=Amber.copy(alpha=.09f),selectedTextColor=Amber,unselectedTextColor=Muted),modifier=Modifier.testTag("nav_$id"))}}
 }}
}

@Composable private fun Home(data:Catalog,user:UserState,lang:String,vm:AtlasViewModel){val hero=data.cases.first{it.id=="cooper"};LazyColumn(Modifier.fillMaxSize().testTag("home_list"),contentPadding=PaddingValues(bottom=24.dp)){
 item{Column{
  Box(Modifier.fillMaxWidth()){
   Art(hero.heroImage()?:hero.images.first().path,lang,Modifier.matchParentSize())
   Box(Modifier.matchParentSize().background(Brush.verticalGradient(listOf(Color.Transparent,Ink.copy(alpha=.25f),Ink))))
   Column(Modifier.fillMaxWidth().padding(horizontal=22.dp).padding(top=18.dp,bottom=12.dp)){
    FlowRow(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Pill(tr(lang,"오늘의 탐색","TODAY'S MYSTERY"));Text(tr(lang,"독립적 관찰","ARCHIVE DIGEST"),color=Muted,fontSize=14.sp,modifier=Modifier.background(Ink.copy(alpha=.6f)).padding(5.dp))}
    Spacer(Modifier.height(138.dp))
    StoryMeta(hero,lang);Text(hero.headline.text(lang),style=MaterialTheme.typography.headlineLarge,modifier=Modifier.padding(top=13.dp));Text(hero.hook.text(lang),style=MaterialTheme.typography.bodyLarge,color=Muted,modifier=Modifier.padding(top=9.dp))
   }
  }
  FlowRow(Modifier.fillMaxWidth().padding(horizontal=22.dp).padding(bottom=16.dp),horizontalArrangement=Arrangement.spacedBy(12.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
   Button(onClick={vm.openQuick(hero.id)},shape=RoundedCornerShape(28.dp),modifier=Modifier.heightIn(min=50.dp)){Text(tr(lang,"10초 미리보기","10-sec Quick Preview"),fontWeight=FontWeight.Bold);Spacer(Modifier.width(10.dp));Glyph("arrow",Ivory,Modifier.size(18.dp))}
   Button(onClick={vm.open(hero.id)},shape=RoundedCornerShape(28.dp),modifier=Modifier.heightIn(min=50.dp).testTag("hero_open")){Text(tr(lang,"본문 열기","Read story"),fontWeight=FontWeight.Bold);Spacer(Modifier.width(10.dp))}
  }}
 }
 item{SectionTitle(tr(lang,"주요 사건","Featured cases"),tr(lang,"작게 시작해보세요","Start with an approachable thread"));LazyRow(contentPadding=PaddingValues(horizontal=20.dp),horizontalArrangement=Arrangement.spacedBy(12.dp)){items(data.cases.filter{it.id!="cooper"}.take(4),key={it.id}){s->StoryCard(s,lang,Modifier.width(230.dp),tag="featured_${s.id}",onClick={vm.open(s.id)})}}}
 item{Column(Modifier.padding(horizontal=20.dp)){SectionTitle(tr(lang,"연결된 사건", "Rabbit hole"),tr(lang,"한 질문이 또 다른 사건으로 이어집니다","One question leads into another"));Row(horizontalArrangement=Arrangement.spacedBy(8.dp),verticalAlignment=Alignment.CenterVertically){Button(onClick=vm::rabbit,shape=RoundedCornerShape(10.dp),modifier=Modifier.testTag("rabbit_open")){Text(tr(lang,"연결 추적 시작","Follow the chain"))}}}}
 item{SectionTitle(tr(lang,"카테고리","Categories"),tr(lang,"이런 주제를 골라보세요","Pick a topic"))
  LazyRow(contentPadding=PaddingValues(horizontal=20.dp),horizontalArrangement=Arrangement.spacedBy(12.dp)){items(data.categories,key={it.id}){c->Surface(shape=RoundedCornerShape(12.dp),color=Panel,border=BorderStroke(1.dp,Line),modifier=Modifier.width(175.dp).testTag("home_category_${c.id}").clickable{vm.category(c.id)}){Column{Art(c.image,lang,Modifier.fillMaxWidth().height(110.dp));Text(c.name.text(lang),style=MaterialTheme.typography.titleMedium,modifier=Modifier.padding(14.dp))}}}}
 }
}}

@Composable private fun Explore(data:Catalog,lang:String,vm:AtlasViewModel){
 val columns=if(LocalConfiguration.current.screenWidthDp<370||LocalDensity.current.fontScale>1.3f)1 else 2
 var showCountry by rememberSaveable { mutableStateOf(false) }
 var selectedCountry by rememberSaveable { mutableStateOf<String?>(null) }
 val countryGroups=data.cases.groupBy{it.country.en.ifBlank {it.country.ko}}
 LazyColumn(Modifier.fillMaxSize().testTag("explore_list"),contentPadding=PaddingValues(20.dp)){
  if(showCountry&&selectedCountry==null){
   item{FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp)){TextButton(onClick={showCountry=false}){Text(tr(lang,"카테고리 보기","Categories"))};TextButton(onClick={selectedCountry=null}){Text(tr(lang,"전체 보기","All Countries"))}}}
   item{Text(tr(lang,"국가 기준 탐색","Browse by country"),style=MaterialTheme.typography.headlineLarge)}
   item{countryGroups.toList().sortedBy{it.first}.forEach{(id,list)->val display=list.firstOrNull()?.country?.text(lang)?:id;val count=list.size;Surface(shape=RoundedCornerShape(12.dp),color=Panel,border=BorderStroke(1.dp,Line),modifier=Modifier.fillMaxWidth().padding(vertical=6.dp).testTag("country_${id}").clickable{selectedCountry=id}){Column(Modifier.padding(14.dp)){Text(display,style=MaterialTheme.typography.titleMedium);Text(tr(lang,"${count}건","$count cases"),color=Muted,style=MaterialTheme.typography.bodySmall)}}}}
  }else if(showCountry&&selectedCountry!=null){
   val list=countryGroups[selectedCountry].orEmpty()
   item{TextButton(onClick={selectedCountry=null}){Text(tr(lang,"국가 목록으로","Back to country list"))}}
   if(list.isEmpty())item{EmptyMessage(tr(lang,"해당 나라 사건이 없습니다","No cases for this country"),tr(lang,"다른 나라부터 확인하세요","Check another country"),"explore_empty")}else item{Text(list.first().country.text(lang),style=MaterialTheme.typography.headlineLarge)}
   items(list,key={it.id}){s->StoryRow(s,lang,"explore_${s.id}"){vm.open(s.id)}}
  }else{
   item{Text(tr(lang,"탐색","Explore"),style=MaterialTheme.typography.headlineLarge);FlowRow{listOf(false,true).forEach{mode->FilterChip(selected=showCountry==mode,onClick={showCountry=mode},label={Text(if(mode)tr(lang,"국가","Country")else tr(lang,"카테고리","Category"))},modifier=Modifier.padding(end=8.dp))}}}
   items(data.categories.chunked(columns)){row->Row(horizontalArrangement=Arrangement.spacedBy(12.dp),modifier=Modifier.padding(bottom=14.dp)){row.forEach{c->Surface(shape=RoundedCornerShape(12.dp),color=Panel,border=BorderStroke(1.dp,Line),modifier=Modifier.weight(1f).testTag("category_${c.id}").clickable{vm.category(c.id)}){Column{Art(c.image,lang,Modifier.fillMaxWidth().height(126.dp));Column(Modifier.padding(13.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Text(c.name.text(lang),style=MaterialTheme.typography.titleMedium);Text(c.hook.text(lang),style=MaterialTheme.typography.bodyMedium,color=Muted);val count=data.cases.count{c.id in it.categoryIds};Text(if(count>0)tr(lang,"${count}건","$count stories")else tr(lang,"아직 준비중","Coming soon"),color=Amber,style=MaterialTheme.typography.labelMedium)}}}}}}
  }
 }
}

@Composable private fun CollectionsScreen(data:Catalog,lang:String,vm:AtlasViewModel){
 val collections=defaultCollections(data.cases,lang)
 LazyColumn(Modifier.fillMaxSize().testTag("collections_list"),contentPadding=PaddingValues(20.dp)){
 item{Text(tr(lang,"컬렉션","Collections"),style=MaterialTheme.typography.headlineLarge)}
 collections.forEach{collection->
  item{SectionTitle(collection.title.text(lang),collection.subtitle.text(lang))}
  val selected=data.cases.filter{it.id in collection.caseIds}
  if(selected.isEmpty())item{Text(tr(lang,"현재 비어 있습니다","No items available yet"),color=Muted,style=MaterialTheme.typography.bodyMedium,modifier=Modifier.padding(bottom=20.dp))}
  items(selected,key={it.id}){s->StoryRow(s,lang,tag="collection_${collection.id}_${s.id}",onClick={vm.open(s.id)})}
 }
}
}

@Composable private fun CategoryScreen(data:Catalog,id:String,lang:String,vm:AtlasViewModel){val c=data.categories.firstOrNull{it.id==id}?:return;val list=data.cases.filter{id in it.categoryIds};LazyColumn(Modifier.fillMaxSize().testTag("category_list"),contentPadding=PaddingValues(20.dp)){
 item{Text(c.name.text(lang),style=MaterialTheme.typography.headlineLarge);Text(c.hook.text(lang),color=Muted,modifier=Modifier.padding(vertical=10.dp))}
 if(list.isEmpty())item{EmptyMessage(tr(lang,"준비 중인 기록입니다","New records on the way"),tr(lang,"다른 카테고리를 탐색해보세요.","Find your next story in another category."),"category_empty");TextButton(onClick={vm.tab("explore")}){Text(tr(lang,"카테고리 더 보기","Explore categories"))}}
 items(list,key={it.id}){s->StoryRow(s,lang){vm.open(s.id)}}
}}

@Composable private fun QuickPreviewScreen(data:Catalog,id:String,lang:String,vm:AtlasViewModel){val story=data.cases.firstOrNull{it.id==id}?:return;val article by vm.article.collectAsStateWithLifecycle();LaunchedEffect(story.id){if(article==null || article?.caseId!=story.id)vm.loadArticle(story.id)};val body=article?.summary?.text(lang)?:"";val minutes=estimateReadingMinutes(story,article,lang)
 Column(Modifier.fillMaxSize().padding(20.dp),verticalArrangement=Arrangement.spacedBy(14.dp),horizontalAlignment=Alignment.CenterHorizontally){
  Text(tr(lang,"10초 퀵 프리뷰","10-second Quick Preview"),style=MaterialTheme.typography.headlineLarge)
  Surface(shape=RoundedCornerShape(14.dp),color=Panel,border=BorderStroke(1.dp,Line),modifier=Modifier.fillMaxWidth()){Column(Modifier.padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){Text(story.headline.text(lang),style=MaterialTheme.typography.titleLarge);StoryMeta(story,lang);ReadMeta(story,minutes,lang);Text(body,style=MaterialTheme.typography.bodyLarge)}}
  Button(onClick={vm.open(story.id)},modifier=Modifier.fillMaxWidth().heightIn(min=50.dp),shape=RoundedCornerShape(10.dp)){Text(tr(lang,"전체 본문 열기","Open full story"))}
  TextButton(onClick={vm.tab("article")}){Text(tr(lang,"뒤로","Back"))}
 }
}

@Composable private fun ArticleScreen(data:Catalog,id:String,user:UserState,lang:String,vm:AtlasViewModel){val story=data.cases.firstOrNull{it.id==id}?:return;val article by vm.article.collectAsStateWithLifecycle();val failed by vm.articleError.collectAsStateWithLifecycle();val pos=user.positions[id]?: (0 to 0);val state=rememberLazyListState(pos.first,pos.second)
 if(failed){Column(Modifier.padding(24.dp)){EmptyMessage(tr(lang,"이 기록을 열 수 없습니다","This record could not be opened"),tr(lang,"다시 열어보거나 다른 기록을 탐색하세요.","Try again or explore another story."),"article_error");Button(onClick={vm.loadArticle(id)}){Text(tr(lang,"다시 시도","Try again"))}};return}
 val a=article?.takeIf{it.caseId==id};if(a==null){Box(Modifier.fillMaxSize(),contentAlignment=Alignment.Center){CircularProgressIndicator()};return}
 val minutes=estimateReadingMinutes(story,a,lang)
 LaunchedEffect(id,state){snapshotFlow{if(state.layoutInfo.totalItemsCount==0) null else Triple(state.firstVisibleItemIndex,state.firstVisibleItemScrollOffset,state.firstVisibleItemIndex>3+a.sections.size||state.layoutInfo.visibleItemsInfo.any{it.key=="reading_end"&&it.offset+it.size<=state.layoutInfo.viewportEndOffset})}.filterNotNull().distinctUntilChanged().collect{vm.position(id,it.first,it.second);if(it.third)vm.complete(id)}}
 LazyColumn(state=state,modifier=Modifier.fillMaxSize().testTag("article_list"),contentPadding=PaddingValues(bottom=28.dp)){
   item{
    Box {
      Art(story.heroImage()?:story.images.first().path,lang,Modifier.fillMaxWidth().height(240.dp),sharedImageNote(story,lang))
      Box(Modifier.fillMaxWidth().height(240.dp).background(Brush.verticalGradient(listOf(Color.Transparent,Ink.copy(alpha=.1f),Ink))))
      Text(sharedImageNote(story,lang)?:tr(lang,"������ ���� �̹����� ����մϴ�.","Editorial reconstruction, not archival evidence"),style=MaterialTheme.typography.labelSmall,color=Muted,modifier=Modifier.align(Alignment.BottomStart).padding(horizontal=20.dp,vertical=9.dp))
    }
  }
  item{Column(Modifier.padding(horizontal=22.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){StoryMeta(story,lang);Text(story.headline.text(lang),style=MaterialTheme.typography.headlineLarge,modifier=Modifier.testTag("article_title"));Text(story.canonicalTitle,color=Amber,style=MaterialTheme.typography.labelLarge);Text(story.hook.text(lang),color=Muted,style=MaterialTheme.typography.bodyLarge);Row(verticalAlignment=Alignment.CenterVertically){ReadMeta(story,minutes,lang);Spacer(Modifier.weight(1f));SaveButton(story,story.id in user.bookmarks,lang){vm.bookmark(story.id)}};ReactionButtons(story,user.reactions[story.id],lang,{vm.react(story.id,ReactionType.POSITIVE)},{vm.react(story.id,ReactionType.NEGATIVE)})}}
  item{Surface(color=Panel,shape=RoundedCornerShape(12.dp),border=BorderStroke(1.dp,Amber.copy(alpha=.3f)),modifier=Modifier.padding(20.dp).testTag("article_summary")){Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){Text(tr(lang,"10초 요약","10-second brief"),color=Amber,style=MaterialTheme.typography.titleMedium);Text(a.summary.text(lang),style=MaterialTheme.typography.bodyLarge)}}}
  items(a.sections,key={it.id}){s->Column(Modifier.fillMaxWidth().padding(horizontal=22.dp).padding(top=15.dp,bottom=17.dp).testTag("section_${s.id}"),verticalArrangement=Arrangement.spacedBy(15.dp)){Text(s.title.text(lang),style=MaterialTheme.typography.titleLarge,color=if(s.type=="timeline")Amber else Ivory);if(s.image!=null){Surface(shape=RoundedCornerShape(10.dp)){Art(story.heroImage()?:story.images.first().path,lang,Modifier.fillMaxWidth().height(190.dp),sharedImageNote(story,lang))};Text(sharedImageNote(story,lang)?:tr(lang,"현장 재구성 이미지","An editorial reconstruction of the scene"),color=Muted,style=MaterialTheme.typography.labelSmall)};if(s.type in listOf("fact","quote","theories"))Surface(color=Panel,shape=RoundedCornerShape(10.dp),border=BorderStroke(1.dp,Line)){Text(s.body.text(lang),style=MaterialTheme.typography.bodyLarge,modifier=Modifier.padding(17.dp))}else Text(s.body.text(lang),style=MaterialTheme.typography.bodyLarge)}}
  item(key="reading_end"){Text(tr(lang,"본문의 끝입니다. 아래에서 증거와 출처를 확인하세요","The article ends here. Explore evidence and sources below"),color=Muted,style=MaterialTheme.typography.labelMedium,modifier=Modifier.fillMaxWidth().padding(22.dp).testTag("article_read_end"))}
  item{Column(Modifier.padding(horizontal=22.dp).padding(top=20.dp,bottom=14.dp).testTag("evidence_section"),verticalArrangement=Arrangement.spacedBy(12.dp)){Text("EVIDENCE LAYER",color=Amber,style=MaterialTheme.typography.labelLarge);Text(tr(lang,"주장과 근거를 분리해 확인하세요","Separate claims from evidence"),style=MaterialTheme.typography.headlineMedium);Text(tr(lang,"확정됨/지지됨/반박됨 등을 구분하세요","Distinguish confirmed/supported/disputed status"))}
  }
  items(a.evidence,key={"ev_${it.id}"}){e->
   val color=when(e.status){EvidenceStatus.CONFIRMED->Color(0xFF96CAA8);EvidenceStatus.SUPPORTED->Color(0xFF7BB5D2);EvidenceStatus.DISPUTED->Amber;EvidenceStatus.ALLEGED->Color(0xFFE0A27F);EvidenceStatus.UNVERIFIED->Color(0xFF9EC7E4);EvidenceStatus.DEBUNKED->Muted;EvidenceStatus.OUTDATED->Color(0xFFB4A1FF);EvidenceStatus.CLAIM->Color(0xFFD8B7A2)}
   Surface(color=Panel,shape=RoundedCornerShape(10.dp),border=BorderStroke(1.dp,Line),modifier=Modifier.padding(horizontal=20.dp,vertical=6.dp).testTag("evidence_${e.id}")){
    Column(Modifier.padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
     Pill(localizedEvidenceLabel(e.status,lang),color)
     e.reason?.let{Text(it.text(lang),style=MaterialTheme.typography.labelMedium,color=Muted)}
     Text(e.text.text(lang),style=MaterialTheme.typography.bodyLarge)
     e.whatItEstablishes?.let{Text("${tr(lang,"확인됨:","What it establishes:")} ${it.text(lang)}",style=MaterialTheme.typography.bodyMedium,color=Muted)}
     e.whatItDoesNotEstablish?.let{Text("${tr(lang,"확인 불가:","What it does not establish:")} ${it.text(lang)}",style=MaterialTheme.typography.bodyMedium,color=Muted)}
    }
   }
  }
  item{Column(Modifier.padding(22.dp).testTag("article_sources"),verticalArrangement=Arrangement.spacedBy(12.dp)){HorizontalDivider(color=Line);Text(tr(lang,"출처와 검증", "Sources & verification"),style=MaterialTheme.typography.titleLarge);Text(tr(lang,"최종 확인일 ${a.verifiedAt}","Last verified • ${a.verifiedAt}"),color=Muted,style=MaterialTheme.typography.bodyMedium)}}
  items(a.sources,key={"src_${it.id}"}){s->val uri=LocalUriHandler.current;Column(Modifier.padding(horizontal=20.dp,vertical=4.dp)){OutlinedButton(onClick={runCatching{uri.openUri(s.url)}},shape=RoundedCornerShape(9.dp),modifier=Modifier.fillMaxWidth().testTag("source_${s.id}")){Column(Modifier.weight(1f).padding(vertical=7.dp)){Text(s.title,modifier=Modifier.fillMaxWidth(),color=Ivory,style=MaterialTheme.typography.bodyMedium);Text(s.publisher,color=Amber,style=MaterialTheme.typography.labelSmall)};Glyph("arrow",Amber,Modifier.size(18.dp))}}}
  item{Column(Modifier.padding(22.dp),verticalArrangement=Arrangement.spacedBy(13.dp)){Text("EVIDENCE / RELIABILITY",style=MaterialTheme.typography.titleMedium);Text(tr(lang,"이미지는 아카이브 기록이 아닙니다.","Image is not an archival record."),color=Muted,style=MaterialTheme.typography.bodyMedium);Button(onClick=vm::rabbit,shape=RoundedCornerShape(10.dp),modifier=Modifier.fillMaxWidth().heightIn(min=52.dp).testTag("rabbit_open")){Text(tr(lang,"연결 사건 보기","Open connected stories"));Spacer(Modifier.width(10.dp));Glyph("arrow",Ivory,Modifier.size(18.dp))}}}
  items(story.related,key={"related_${it.caseId}"}){r->val next=data.cases.firstOrNull{it.id==r.caseId}?:return@items;Column(Modifier.padding(horizontal=22.dp)){Pill("${r.type.copy.text(lang)}",Muted);Text(r.reason.text(lang),color=Amber,style=MaterialTheme.typography.bodyMedium);StoryRow(next,lang,tag="related_${next.id}",onClick={vm.open(next.id,true)})}}
 }
}

@Composable private fun RabbitScreen(data:Catalog,lang:String,vm:AtlasViewModel){val path by vm.path.collectAsStateWithLifecycle();val user by vm.user.collectAsStateWithLifecycle();val current=data.cases.firstOrNull{it.id==path.lastOrNull()}?:data.cases.first();LazyColumn(Modifier.fillMaxSize().testTag("rabbit_list"),contentPadding=PaddingValues(22.dp)){
 item{Text("RABBIT HOLE",color=Amber,style=MaterialTheme.typography.headlineMedium);Text(tr(lang,"의문은 관계로 이어집니다.","One question leads to another connection."),style=MaterialTheme.typography.bodyLarge,color=Muted,modifier=Modifier.padding(vertical=10.dp));Text("${tr(lang,"현재 경로","Rabbit hole depth")} ${path.size.coerceAtLeast(1)}",color=Amber,style=MaterialTheme.typography.labelMedium,modifier=Modifier.testTag("rabbit_depth").padding(vertical=8.dp))}
 item{Surface(color=Panel,shape=RoundedCornerShape(12.dp),border=BorderStroke(1.dp,Line)){Column(Modifier.padding(14.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Text(tr(lang,"현재 연결","CURRENT CONNECTION"),color=Muted,style=MaterialTheme.typography.labelSmall);Text(current.canonicalTitle,style=MaterialTheme.typography.titleLarge);Pill(current.status.text(lang))}}}
 item{if(current.related.all{it.caseId in path||it.caseId in user.recent}){Column(Modifier.testTag("rabbit_exhausted")){EmptyMessage(tr(lang,"모든 연결을 탐색했습니다","No new chain available"),tr(lang,"저장한 관련 사건을 다시 보거나 새 주제를 탐색하세요.","Revisit a saved case or explore another category."),"rabbit_exhausted_message");Button(onClick={vm.tab("explore")},modifier=Modifier.testTag("rabbit_explore")){Text(tr(lang,"탐색으로 이동","Explore topics"))}}}}
 items(current.related,key={it.caseId}){r->val s=data.cases.firstOrNull{it.id==r.caseId}?:return@items;Column(Modifier.padding(bottom=14.dp)){if(s.id in path)Pill(tr(lang,"이미 방문","Visited"));Text(r.reason.text(lang),color=Amber,style=MaterialTheme.typography.bodyMedium,modifier=Modifier.padding(bottom=9.dp));StoryRow(s,lang,tag="related_${s.id}"){vm.open(s.id,true)}}}
}
}

@Composable private fun SearchScreen(lang:String,vm:AtlasViewModel){val query by vm.query.collectAsStateWithLifecycle();val list=vm.results();val keyboard=LocalSoftwareKeyboardController.current;Column(Modifier.fillMaxSize().padding(horizontal=20.dp)){Text(tr(lang,"검색","Search"),style=MaterialTheme.typography.headlineLarge,modifier=Modifier.padding(top=22.dp,bottom=18.dp));OutlinedTextField(value=query,onValueChange=vm::query,keyboardOptions=KeyboardOptions(imeAction=ImeAction.Search),keyboardActions=KeyboardActions(onSearch={keyboard?.hide()}),placeholder={Text(tr(lang,"사건, 인물, 장소를 검색하세요","Search stories, people, places"),fontSize=15.sp)},singleLine=true,leadingIcon={Glyph("search",Muted)},shape=RoundedCornerShape(12.dp),modifier=Modifier.fillMaxWidth().testTag("search_input"));if(query.isBlank())Text(tr(lang,"검색어를 입력해 탐색하세요","START WITH A QUESTION"),color=Amber,style=MaterialTheme.typography.labelLarge,modifier=Modifier.padding(top=22.dp,bottom=8.dp))else Text(tr(lang,"${list.size}건","${list.size} records"),color=Muted,modifier=Modifier.padding(top=18.dp));LazyColumn(Modifier.fillMaxSize().testTag("search_results"),contentPadding=PaddingValues(bottom=24.dp)){if(list.isEmpty())item{EmptyMessage(tr(lang,"검색 결과가 없습니다","No stories found"),tr(lang,"다른 키워드로 다시 시도하세요.","Try another keyword."),"search_empty")};items(list,key={it.id}){s->StoryRow(s,lang,tag="search_result_${s.id}"){vm.open(s.id)}}}}
}

@OptIn(ExperimentalLayoutApi::class)
@Composable private fun SavedScreen(data:Catalog,user:UserState,lang:String,vm:AtlasViewModel){val list=data.cases.filter{it.id in user.bookmarks};LazyColumn(Modifier.fillMaxSize().testTag("saved_list"),contentPadding=PaddingValues(20.dp)){
 item{Text(tr(lang,"저장한 사건","Saved stories"),style=MaterialTheme.typography.headlineLarge);FlowRow(Modifier.fillMaxWidth().padding(bottom=14.dp,top=14.dp),horizontalArrangement=Arrangement.spacedBy(10.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){Pill(tr(lang,"총 ${list.size}","All ${list.size}"));TextButton(onClick=vm::recent,modifier=Modifier.testTag("recent_open")){Glyph("clock",Amber,Modifier.size(17.dp));Spacer(Modifier.width(7.dp));Text(tr(lang,"최근 본", "Recently read"))}}}
 if(list.isEmpty())item{EmptyMessage(tr(lang,"아직 저장한 사건이 없어요","No saved cases yet"),tr(lang,"본문에서 저장 아이콘을 눌러보세요.","Save a story to return to it here."),"saved_empty");Button(onClick={vm.tab("home")}){Text(tr(lang,"탐색 시작","Discover stories"))}}
 items(list,key={it.id}){s->Row(verticalAlignment=Alignment.CenterVertically){Box(Modifier.weight(1f)){StoryRow(s,lang,readingState=if(s.id in user.recent)tr(lang,"최근 본","Recently read")else null){vm.open(s.id)}};SaveButton(s,true,lang){vm.bookmark(s.id)}}}
}}

@Composable private fun RecentScreen(data:Catalog,user:UserState,lang:String,vm:AtlasViewModel){val list=user.recent.mapNotNull{id->data.cases.firstOrNull{it.id==id}};LazyColumn(Modifier.fillMaxSize().testTag("recent_list"),contentPadding=PaddingValues(20.dp)){
 item{Text(tr(lang,"최근 본 기록","Recently read"),style=MaterialTheme.typography.headlineLarge);Text(tr(lang,"마지막으로 읽던 사건으로 다시 시작하세요.","Pick up what you left behind."),color=Muted,style=MaterialTheme.typography.bodyLarge,modifier=Modifier.padding(vertical=12.dp))}
 if(list.isEmpty())item{EmptyMessage(tr(lang,"아직 기록이 없습니다","No history yet"),tr(lang,"시작하려면 홈에서 사건을 열어보세요.","Open a story first to create reading history."),"recent_empty")}
 items(list,key={it.id}){s->StoryRow(s,lang,readingState=tr(lang,"최근 조회","Recent"),onClick={vm.open(s.id)})}
}}

private fun estimateReadingMinutes(story:Story,article:Article?,lang:String):Int{
 if(article==null) return story.minutes(lang)
 val content=buildString{append(article.summary.text(lang));article.sections.forEach{append(it.body.text(lang));append(' ')}}
 return defaultReadingTime(lang,content,lang)
}
