from flask_mail import Message
import random

# YOU JUST GOTTA LOVE WIKIPEDIA LISTS:
# http://en.wikipedia.org/wiki/List_of_Pixar_characters
# http://en.wikipedia.org/wiki/List_of_The_Simpsons_characters
NAMES = ["Homer", "Marge", "Bart", "Lisa", "Maggie", "Akira", "Aristotle", "Atkins", "Mary", "Birchibald", "Jasper", "Benjamin", "Bill", "Blinky", "Blue", "Boobarella", "Wendell", "Jacqueline", "Ling", "Patty", "Selma", "Kent", "Bumblebee", "Charles", "Capital", "Carl", "Crazy", "Charlie", "Chase", "Scott", "Comic", "Database", "Declan", "Disco", "Dolph", "Lunchlady", "Duffman", "Eddie", "Ernst", "Fat", "Maude", "Ned", "Rod", "Todd", "Francesca", "Frankie", "Professor", "Baby", "Gino", "Gloria", "Barney", "Gil", "Judge", "Herman", "Bernice", "Elizabeth", "Lionel", "Itchy", "Jimbo", "Rachel", "Kang", "Princess", "Kearney", "Edna", "Rabbi", "Krusty", "Cookie", "Dewey", "Legs", "Leopold", "Lenny", "Lewis", "Helen", "Reverend", "Coach", "Luigi", "Lurleen", "Otto", "Captain", "Roger", "Troy", "Hans", "Nelson", "Bleeding", "Lindsey", "Apu", "Manjula", "Sanjay", "Patches", "Arnie", "Poochie", "Herbert", "Janey", "Lois", "Ruth", "Martin", "Mayor", "Radioactive", "Richard", "Sherri", "Dave", "Sideshow", "Grampa", "Amber", "Mona", "Agnes", "Waylon", "Snake", "Snowball", "Judge", "Jebediah", "Cletus", "Brandine", "Moe", "Drederick", "Allison", "Mr.", "Cecil", "Johnny", "Kirk", "Luann", "Milhouse", "Chief", "Ralph", "Sarah", "Groundskeeper", "Wiseguy", "Rainier", "Yes", "Artie", "Abominable", "Acer", "Al", "Alfredo", "Anchor", "Andy", "Anger", "Anton", "Art", "Auguste", "Auto", "Bernie", "Bloat", "Bo", "Bomb", "Boo", "Bookworm", "Brent", "Brock", "Bruce", "Bubbles", "Bullseye", "Buttercup", "Buzz", "Captain", "Carl", "Carrie", "Celia", "Charles", "Charlie", "Chatter", "Chet", "Chuckles", "Chunk", "Chum", "Claire", "Collette", "Coral", "Crabby", "Crow", "Crush", "Darla", "Darrell", "Dash", "David", "Dean", "Deb", "Dim", "Disgust", "Django", "Doc", "Dolly", "Don", "Dory", "Dug", "Edna", "Elastigirl", "Elinor", "Ellie", "Emile", "Emperor", "EVE", "Fear", "Fillmore", "Finn", "Flik", "Flo", "Francesco", "Francis", "Fred", "Frozone", "Fungus", "George", "Geri", "Gilbert", "Gill", "Gordon", "Grem", "Guido", "Gurgle", "Gypsy", "Hal", "Hamm", "Hannah", "Harv", "Heimlich", "Henry", "Holley", "Hopper", "Jack-Jack", "Jacques", "James", "Jeff", "Jerry", "Jessie", "John", "Johnny", "Joy", "Karen", "Kari", "Ken", "Kevin", "King", "Lenny", "Lewis", "Lightning", "Lizzie", "Lord", "Luigi", "Mack", "Mama", "Manny", "Marlin", "Martin", "Mary", "Mater", "Maudie", "Merida", "Mike", "Miles", "Minny", "Mirage", "M-O", "Molly", "Molt", "Moonfish", "Mustafa", "Needleman", "Nemo", "Nigel", "Otis", "P.T.", "Peach", "Peter", "Princess", "Princess", "Professor", "Queen", "Ramone", "Randall", "RC", "Red", "Referee", "Remy", "Rex", "Rick", "Riley", "Rod", "Rosie", "Roz", "Russell", "Sadness", "Sally", "Sarge", "Scott", "Scud", "Sheriff", "Sherri", "Sid", "Siddeley", "Skinner", "Slim", "Slinky", "Slug", "Squeeze", "Squirt", "Stinky", "Stretch", "Strip", "Syndrome", "Terri", "Terry", "Tom", "Tomber", "Tony", "Tour", "Trixie", "Tuck", "Twitch", "Uncle", "Underminer", "Violet", "WALL-E", "Wee", "Wheezy", "Witch"]

def generate_password():
    entropy = [str(random.randint(0, 20)),
               random.choice(NAMES)]
    random.shuffle(entropy)
    return "{}{}".format(random.choice(NAMES), "".join(entropy))


def send_email(subject, content, recipients, sender=None):
    from app import mail

    if isinstance(recipients, basestring):
        recipients = [recipients]

    msg = Message(subject, recipients=recipients, sender=sender)
    msg.body = content
    mail.send(msg)
