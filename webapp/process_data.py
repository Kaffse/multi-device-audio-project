from django.http import HttpRequest
import datetime, json
from webapp.models import Event, Recording, Image
from django.core.serializers.json import DjangoJSONEncoder

def process(file, data):
    extn = file.name.split('.')[-1]
    title = data['file_name'] + '.' + extn
    path = 'static/data/' + title # I modified this from "data/" because django was being a nuisance and not letting me link to things outside /static/ (gadam)
    with open(path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    rec = Recording(file_name = data["file_name"], length = 0.01, start_time = datetime.datetime.today(), end_time = datetime.datetime.today(), description = data["description"], rec_file = path, lon = data['lon'], lat = data['lat'])
    rec.save()

	
#hurts

def test():
	#json_serializer = serializers.get_serializer("json")()
	json_serializer = serializers.get_serializer("json")()
	with open("../static/scripts/data.json", "w") as out:
			json_serializer.serialize(Recording.objects.all(), stream=out)
			#HttpResponse(simplejson.dumps(items_list),'application/json'))
			
		
#JSON export for timeline

def export():
	recs = []

	for recording in Recording.objects.all():
		
		rec_data = {
			"startDate":recording.start_time.strftime("%Y,%m,%d %H,%M"),
			"endDate":recording.end_time.strftime("%Y,%m,%d %H,%M"),
			"headline":recording.file_name,
			"text":"<p>Length: " + str(recording.length) + "\n" + "Event: " + str(recording.event_assoc) + "\n" + recording.description + "</p>", #HTML + IMG rec. description
			"asset": {
				"media":"https://maps.google.com/?q=" + str(recording.lat) + "," + str(recording.lon), #recording.rec_file.url, http://link_to_recording_file_music_player
				"caption":"ID" + str(recording.file_ID)
			}
		}
	
		recs.append(rec_data)


	serialized = {
		"timeline":
		{
			"headline":"MDAP timeline",
			"type":"default",
			"text":"<p>Here is your personal MDAP timeline.</p>",
			"asset": {
				"media":"http://mdap.org/images/icon.png",
				"caption":"Multi Device Recording System"
			},
			"date": recs
			
		}
	}

	with open('./templates/webapp/scripts/data.json', 'w') as outp:
		json.dump(serialized, outp)
		
		
